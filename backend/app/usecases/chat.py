import json
import logging
from copy import deepcopy
from datetime import datetime
from typing import Literal

from anthropic.types import Message as AnthropicMessage
from app.bedrock import (
    InvocationMetrics,
    calculate_price,
    compose_args,
    get_bedrock_response,
)
from app.prompt import build_rag_prompt
from app.repositories.conversation import (
    RecordNotFoundError,
    find_conversation_by_id,
    store_conversation,
)
from app.repositories.custom_bot import find_alias_by_id, store_alias
from app.repositories.models.conversation import (
    ChunkModel,
    ContentModel,
    ConversationModel,
    MessageModel,
)
from app.repositories.models.custom_bot import BotAliasModel, BotModel
from app.routes.schemas.conversation import (
    ChatInput,
    ChatOutput,
    Chunk,
    Content,
    Conversation,
    FeedbackOutput,
    MessageOutput,
    RelatedDocumentsOutput,
)
from app.usecases.bot import fetch_bot, modify_bot_last_used_time
from app.utils import (
    get_anthropic_client,
    get_bedrock_client,
    get_current_time,
    is_anthropic_model,
    is_running_on_lambda,
)
from app.vector_search import (
    SearchResult,
    filter_used_results,
    get_source_link,
    search_related_docs,
)
from ulid import ULID

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

client = get_anthropic_client()


def prepare_conversation(
    user_id: str,
    chat_input: ChatInput,
) -> tuple[str, ConversationModel, BotModel | None]:
    current_time = get_current_time()
    bot = None

    try:
        # Fetch existing conversation
        conversation = find_conversation_by_id(user_id, chat_input.conversation_id)
        logger.info(f"Found conversation: {conversation}")
        parent_id = chat_input.message.parent_message_id
        if chat_input.message.parent_message_id == "system" and chat_input.bot_id:
            # The case editing first user message and use bot
            parent_id = "instruction"
        elif chat_input.message.parent_message_id is None:
            parent_id = conversation.last_message_id
        if chat_input.bot_id:
            logger.info("Bot id is provided. Fetching bot.")
            owned, bot = fetch_bot(user_id, chat_input.bot_id)
    except RecordNotFoundError:
        # The case for new conversation. Note that editing first user message is not considered as new conversation.
        logger.info(
            f"No conversation found with id: {chat_input.conversation_id}. Creating new conversation."
        )

        initial_message_map = {
            # Dummy system message, which is used for root node of the message tree.
            "system": MessageModel(
                role="system",
                content=[
                    ContentModel(
                        content_type="text",
                        media_type=None,
                        body="",
                    )
                ],
                model=chat_input.message.model,
                children=[],
                parent=None,
                create_time=current_time,
                feedback=None,
                used_chunks=None,
            )
        }
        parent_id = "system"
        if chat_input.bot_id:
            logger.info("Bot id is provided. Fetching bot.")
            parent_id = "instruction"
            # Fetch bot and append instruction
            owned, bot = fetch_bot(user_id, chat_input.bot_id)
            initial_message_map["instruction"] = MessageModel(
                role="instruction",
                content=[
                    ContentModel(
                        content_type="text",
                        media_type=None,
                        body=bot.instruction,
                    )
                ],
                model=chat_input.message.model,
                children=[],
                parent="system",
                create_time=current_time,
                feedback=None,
                used_chunks=None,
            )
            initial_message_map["system"].children.append("instruction")

            if not owned:
                try:
                    # Check alias is already created
                    find_alias_by_id(user_id, chat_input.bot_id)
                except RecordNotFoundError:
                    logger.info(
                        "Bot is not owned by the user. Creating alias to shared bot."
                    )
                    # Create alias item
                    store_alias(
                        user_id,
                        BotAliasModel(
                            id=bot.id,
                            title=bot.title,
                            description=bot.description,
                            original_bot_id=chat_input.bot_id,
                            create_time=current_time,
                            last_used_time=current_time,
                            is_pinned=False,
                            sync_status=bot.sync_status,
                            has_knowledge=bot.has_knowledge(),
                        ),
                    )

        # Create new conversation
        conversation = ConversationModel(
            id=chat_input.conversation_id,
            title="New conversation",
            total_price=0.0,
            create_time=current_time,
            message_map=initial_message_map,
            last_message_id="",
            bot_id=chat_input.bot_id,
        )

    # Append user chat input to the conversation
    if chat_input.message.message_id:
        message_id = chat_input.message.message_id
    else:
        message_id = str(ULID())
    new_message = MessageModel(
        role=chat_input.message.role,
        content=[
            ContentModel(
                content_type=c.content_type,
                media_type=c.media_type,
                body=c.body,
            )
            for c in chat_input.message.content
        ],
        model=chat_input.message.model,
        children=[],
        parent=parent_id,
        create_time=current_time,
        feedback=None,
        used_chunks=None,
    )
    conversation.message_map[message_id] = new_message
    conversation.message_map[parent_id].children.append(message_id)  # type: ignore

    return (message_id, conversation, bot)


def trace_to_root(
    node_id: str | None, message_map: dict[str, MessageModel]
) -> list[MessageModel]:
    """Trace message map from leaf node to root node."""
    result = []
    if not node_id or node_id == "system":
        node_id = "instruction" if "instruction" in message_map else "system"

    current_node = message_map.get(node_id)
    while current_node:
        result.append(current_node)
        parent_id = current_node.parent
        if parent_id is None:
            break
        current_node = message_map.get(parent_id)

    return result[::-1]


def insert_knowledge(
    conversation: ConversationModel,
    search_results: list[SearchResult],
    display_citation: bool = True,
) -> ConversationModel:
    """Insert knowledge to the conversation."""
    if len(search_results) == 0:
        return conversation

    inserted_prompt = build_rag_prompt(conversation, search_results, display_citation)
    logger.info(f"Inserted prompt: {inserted_prompt}")

    conversation_with_context = deepcopy(conversation)
    conversation_with_context.message_map["instruction"].content[
        0
    ].body = inserted_prompt

    return conversation_with_context


def chat(user_id: str, chat_input: ChatInput) -> ChatOutput:
    user_msg_id, conversation, bot = prepare_conversation(user_id, chat_input)

    message_map = conversation.message_map
    search_results = []
    if bot and is_running_on_lambda():
        # NOTE: `is_running_on_lambda`is a workaround for local testing due to no postgres mock.
        # Fetch most related documents from vector store
        # NOTE: Currently embedding not support multi-modal. For now, use the last content.
        query = conversation.message_map[user_msg_id].content[-1].body

        search_results = search_related_docs(
            bot_id=bot.id, limit=bot.search_params.max_results, query=query
        )
        logger.info(f"Search results from vector store: {search_results}")

        # Insert contexts to instruction
        conversation_with_context = insert_knowledge(
            conversation, search_results, display_citation=bot.display_retrieved_chunks
        )
        message_map = conversation_with_context.message_map

    messages = trace_to_root(
        node_id=chat_input.message.parent_message_id, message_map=message_map
    )
    messages.append(chat_input.message)  # type: ignore

    # Create payload to invoke Bedrock
    args = compose_args(
        messages=messages,
        model=chat_input.message.model,
        instruction=(
            message_map["instruction"].content[0].body
            if "instruction" in message_map
            else None
        ),
        generation_params=(bot.generation_params if bot else None),
    )

    if is_anthropic_model(args["model"]):
        client = get_anthropic_client()
        response: AnthropicMessage = client.messages.create(**args)
        reply_txt = response.content[0].text
    else:
        response = get_bedrock_response(args)  # type: ignore
        reply_txt = response["outputs"][0]["text"]  # type: ignore

    # Used chunks for RAG generation
    used_chunks = None
    if bot and bot.display_retrieved_chunks and is_running_on_lambda():
        used_chunks = [
            ChunkModel(content=r.content, source=r.source, rank=r.rank)
            for r in filter_used_results(reply_txt, search_results)
        ]

    # Issue id for new assistant message
    assistant_msg_id = str(ULID())
    # Append bedrock output to the existing conversation
    message = MessageModel(
        role="assistant",
        content=[ContentModel(content_type="text", body=reply_txt, media_type=None)],
        model=chat_input.message.model,
        children=[],
        parent=user_msg_id,
        create_time=get_current_time(),
        feedback=None,
        used_chunks=used_chunks,
    )
    conversation.message_map[assistant_msg_id] = message

    # Append children to parent
    conversation.message_map[user_msg_id].children.append(assistant_msg_id)
    conversation.last_message_id = assistant_msg_id

    if is_anthropic_model(args["model"]):
        # Update total pricing
        input_tokens = response.usage.input_tokens
        output_tokens = response.usage.output_tokens
    else:
        metrics: InvocationMetrics = response["amazon-bedrock-invocationMetrics"]  # type: ignore
        input_tokens = metrics.input_tokens
        output_tokens = metrics.output_tokens

    price = calculate_price(chat_input.message.model, input_tokens, output_tokens)
    conversation.total_price += price

    # Store updated conversation
    store_conversation(user_id, conversation)
    # Update bot last used time
    if chat_input.bot_id:
        logger.info("Bot id is provided. Updating bot last used time.")
        # Update bot last used time
        modify_bot_last_used_time(user_id, chat_input.bot_id)

    output = ChatOutput(
        conversation_id=conversation.id,
        create_time=conversation.create_time,
        message=MessageOutput(
            role=message.role,
            content=[
                Content(
                    content_type=c.content_type,
                    body=c.body,
                    media_type=c.media_type,
                )
                for c in message.content
            ],
            model=message.model,
            children=message.children,
            parent=message.parent,
            feedback=None,
            used_chunks=(
                [
                    Chunk(
                        content=c.content,
                        source=c.source,
                        rank=c.rank,
                    )
                    for c in message.used_chunks
                ]
                if message.used_chunks
                else None
            ),
        ),
        bot_id=conversation.bot_id,
    )

    return output


def propose_conversation_title(
    user_id: str,
    conversation_id: str,
    model: Literal[
        "claude-instant-v1",
        "claude-v2",
        "claude-v3-opus",
        "claude-v3-sonnet",
        "claude-v3-haiku",
        "mistral-7b-instruct",
        "mixtral-8x7b-instruct",
        "mistral-large",
    ] = "claude-v3-haiku",
) -> str:
    PROMPT = """Reading the conversation above, what is the appropriate title for the conversation? When answering the title, please follow the rules below:
<rules>
- Title length must be from 15 to 20 characters.
- Prefer more specific title than general. Your title should always be distinct from others.
- Return the conversation title only. DO NOT include any strings other than the title.
- Title must be in the same language as the conversation.
</rules>
"""
    # Fetch existing conversation
    conversation = find_conversation_by_id(user_id, conversation_id)

    messages = trace_to_root(
        node_id=conversation.last_message_id,
        message_map=conversation.message_map,
    )

    # Append message to generate title
    new_message = MessageModel(
        role="user",
        content=[
            ContentModel(
                content_type="text",
                body=PROMPT,
                media_type=None,
            )
        ],
        model=model,
        children=[],
        parent=conversation.last_message_id,
        create_time=get_current_time(),
        feedback=None,
        used_chunks=None,
    )
    messages.append(new_message)

    # Invoke Bedrock
    args = compose_args(
        messages=messages,
        model=model,
    )
    if is_anthropic_model(args["model"]):
        response = client.messages.create(**args)
        reply_txt = response.content[0].text
    else:
        response: AnthropicMessage = get_bedrock_response(args)["outputs"][0]  # type: ignore[no-redef]
        reply_txt = response["text"]
    return reply_txt


def fetch_conversation(user_id: str, conversation_id: str) -> Conversation:
    conversation = find_conversation_by_id(user_id, conversation_id)

    message_map = {
        message_id: MessageOutput(
            role=message.role,
            content=[
                Content(
                    content_type=c.content_type,
                    body=c.body,
                    media_type=c.media_type,
                )
                for c in message.content
            ],
            model=message.model,
            children=message.children,
            parent=message.parent,
            feedback=(
                FeedbackOutput(
                    thumbs_up=message.feedback.thumbs_up,
                    category=message.feedback.category,
                    comment=message.feedback.comment,
                )
                if message.feedback
                else None
            ),
            used_chunks=(
                [
                    Chunk(
                        content=c.content,
                        source=c.source,
                        rank=c.rank,
                    )
                    for c in message.used_chunks
                ]
                if message.used_chunks
                else None
            ),
        )
        for message_id, message in conversation.message_map.items()
    }
    # Omit instruction
    if "instruction" in message_map:
        for c in message_map["instruction"].children:
            message_map[c].parent = "system"
        message_map["system"].children = message_map["instruction"].children

        del message_map["instruction"]

    output = Conversation(
        id=conversation_id,
        title=conversation.title,
        create_time=conversation.create_time,
        last_message_id=conversation.last_message_id,
        message_map=message_map,
        bot_id=conversation.bot_id,
    )
    return output


def fetch_related_documents(
    user_id: str, chat_input: ChatInput
) -> list[RelatedDocumentsOutput] | None:
    """Retrieve related documents from vector store.
    If `display_retrieved_chunks` is disabled, return None.
    """
    if not chat_input.bot_id:
        return []

    _, bot = fetch_bot(user_id, chat_input.bot_id)
    if not bot.display_retrieved_chunks:
        return None

    chunks = search_related_docs(
        bot_id=bot.id,
        limit=bot.search_params.max_results,
        query=chat_input.message.content[-1].body,
    )

    documents = []
    for chunk in chunks:
        content_type, source_link = get_source_link(chunk.source)
        documents.append(
            RelatedDocumentsOutput(
                chunk_body=chunk.content,
                content_type=content_type,
                source_link=source_link,
                rank=chunk.rank,
            )
        )
    return documents
