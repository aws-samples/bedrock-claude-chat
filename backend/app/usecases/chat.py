import logging
from copy import deepcopy
from typing import Literal

from anthropic.types import Message as AnthropicMessage
from app.agents.agent import AgentExecutor, create_react_agent, format_log_to_str
from app.agents.handlers.token_count import get_token_count_callback
from app.agents.handlers.used_chunk import get_used_chunk_callback
from app.agents.langchain import BedrockLLM
from app.agents.tools.knowledge import AnswerWithKnowledgeTool
from app.agents.utils import get_tool_by_name
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
from app.repositories.models.custom_bot import (
    BotAliasModel,
    BotModel,
    ConversationQuickStarterModel,
)
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
                        file_name=None,
                    )
                ],
                model=chat_input.message.model,
                children=[],
                parent=None,
                create_time=current_time,
                feedback=None,
                used_chunks=None,
                thinking_log=None,
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
                        file_name=None,
                    )
                ],
                model=chat_input.message.model,
                children=[],
                parent="system",
                create_time=current_time,
                feedback=None,
                used_chunks=None,
                thinking_log=None,
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
                            has_agent=bot.is_agent_enabled(),
                            conversation_quick_starters=(
                                []
                                if bot.conversation_quick_starters is None
                                else [
                                    ConversationQuickStarterModel(
                                        title=starter.title,
                                        example=starter.example,
                                    )
                                    for starter in bot.conversation_quick_starters
                                ]
                            ),
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
            should_continue=False,
        )

    # Append user chat input to the conversation
    if chat_input.message.message_id:
        message_id = chat_input.message.message_id
    else:
        message_id = str(ULID())
    # If the "Generate continue" button is pressed, a new_message is not generated.
    if not chat_input.continue_generate:
        new_message = MessageModel(
            role=chat_input.message.role,
            content=[
                ContentModel(
                    content_type=c.content_type,
                    media_type=c.media_type,
                    body=c.body,
                    file_name=c.file_name,
                )
                for c in chat_input.message.content
            ],
            model=chat_input.message.model,
            children=[],
            parent=parent_id,
            create_time=current_time,
            feedback=None,
            used_chunks=None,
            thinking_log=None,
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
    used_chunks = None
    price = 0.0
    thinking_log = None

    if bot and bot.is_agent_enabled():
        logger.info("Bot has agent tools. Using agent for response.")
        llm = BedrockLLM.from_model(model=chat_input.message.model)

        tools = [get_tool_by_name(t.name) for t in bot.agent.tools]

        if bot and bot.has_knowledge():
            logger.info("Bot has knowledge. Adding answer with knowledge tool.")
            answer_with_knowledge_tool = AnswerWithKnowledgeTool.from_bot(
                bot=bot,
                llm=llm,
            )
            tools.append(answer_with_knowledge_tool)

        logger.info(f"Tools: {tools}")
        agent = create_react_agent(
            model=chat_input.message.model,
            tools=tools,
            generation_config=bot.generation_params,
        )
        executor = AgentExecutor(
            name="Agent Executor",
            agent=agent,
            tools=tools,
            return_intermediate_steps=True,
            callbacks=[],
            verbose=False,
            max_iterations=15,
            max_execution_time=None,
            early_stopping_method="force",
            handle_parsing_errors=True,
        )

        with get_token_count_callback() as token_cb, get_used_chunk_callback() as chunk_cb:
            agent_response = executor.invoke(
                {
                    "input": chat_input.message.content[0].body,  # type: ignore
                },
                config={
                    "callbacks": [
                        token_cb,
                        chunk_cb,
                    ],
                },
            )
            price = token_cb.total_cost
            if bot.display_retrieved_chunks and chunk_cb.used_chunks:
                used_chunks = chunk_cb.used_chunks
            thinking_log = format_log_to_str(
                agent_response.get("intermediate_steps", [])
            )
            logger.info(f"Thinking log: {thinking_log}")

        reply_txt = agent_response["output"]
    else:
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
                conversation,
                search_results,
                display_citation=bot.display_retrieved_chunks,
            )
            message_map = conversation_with_context.message_map

        messages = trace_to_root(
            node_id=chat_input.message.parent_message_id, message_map=message_map
        )

        if not chat_input.continue_generate:
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

        reply_txt = reply_txt.rstrip()

        # Used chunks for RAG generation
        if bot and bot.display_retrieved_chunks and is_running_on_lambda():
            if len(search_results) > 0:
                used_chunks = []
                for r in filter_used_results(reply_txt, search_results):
                    content_type, source_link = get_source_link(r.source)
                    used_chunks.append(
                        ChunkModel(
                            content=r.content,
                            content_type=content_type,
                            source=source_link,
                            rank=r.rank,
                        )
                    )
        if is_anthropic_model(args["model"]):
            # Update total pricing
            input_tokens = response.usage.input_tokens
            output_tokens = response.usage.output_tokens
        else:
            metrics: InvocationMetrics = response["amazon-bedrock-invocationMetrics"]  # type: ignore
            input_tokens = metrics.input_tokens
            output_tokens = metrics.output_tokens
        price = calculate_price(chat_input.message.model, input_tokens, output_tokens)

    # Issue id for new assistant message
    assistant_msg_id = str(ULID())
    # Append bedrock output to the existing conversation
    message = MessageModel(
        role="assistant",
        content=[
            ContentModel(
                content_type="text", body=reply_txt, media_type=None, file_name=None
            )
        ],
        model=chat_input.message.model,
        children=[],
        parent=user_msg_id,
        create_time=get_current_time(),
        feedback=None,
        used_chunks=used_chunks,
        thinking_log=thinking_log,
    )

    if chat_input.continue_generate:
        conversation.message_map[conversation.last_message_id].content[
            0
        ].body += reply_txt
    else:
        conversation.message_map[assistant_msg_id] = message

        # Append children to parent
        conversation.message_map[user_msg_id].children.append(assistant_msg_id)
        conversation.last_message_id = assistant_msg_id

    conversation.total_price += price

    # If continued, save the state
    conversation.should_continue = response.stop_reason == "max_tokens"

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
                    file_name=None,
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
                        content_type=c.content_type,
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
        "claude-v3.5-sonnet",
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
                file_name=None,
            )
        ],
        model=model,
        children=[],
        parent=conversation.last_message_id,
        create_time=get_current_time(),
        feedback=None,
        used_chunks=None,
        thinking_log=None,
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
                    file_name=c.file_name,
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
                        content_type=c.content_type,
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
        should_continue=conversation.should_continue,
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
