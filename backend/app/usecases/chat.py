from ulid import ULID
from app.vector_search import SearchResult, get_source_link, search_related_docs
from app.utils import (
    get_bedrock_client,
    get_anthropic_client,
    get_current_time,
    is_running_on_lambda,
    is_anthropic_model,
    is_mistral_model,
)
import json
import logging
from copy import deepcopy
from datetime import datetime
from typing import Literal

from anthropic.types import Message as AnthropicMessage
from app.bedrock import calculate_price, compose_args
from app.config import GENERATION_CONFIG, SEARCH_CONFIG
from app.repositories.conversation import (
    RecordNotFoundError,
    find_conversation_by_id,
    store_conversation,
)
from app.repositories.custom_bot import find_alias_by_id, store_alias
from app.repositories.models.conversation import (
    ContentModel,
    ConversationModel,
    MessageModel,
)
from app.repositories.models.custom_bot import BotAliasModel, BotModel
from app.routes.schemas.conversation import (
    ChatInput,
    ChatOutput,
    Content,
    Conversation,
    MessageOutput,
    RelatedDocumentsOutput,
)
from app.usecases.bot import fetch_bot, modify_bot_last_used_time


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
            # Dummy system message
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
    )
    conversation.message_map[message_id] = new_message
    logger.debug(f"parent_id in message_map: {parent_id}")
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
    conversation: ConversationModel, search_results: list[SearchResult]
) -> ConversationModel:
    """Insert knowledge to the conversation."""
    if len(search_results) == 0:
        return conversation

    instruction_prompt = conversation.message_map["instruction"].content[0].body

    context_prompt = ""
    for result in search_results:
        context_prompt += f"<search_result>\n<content>\n{result.content}</content>\n<source>\n{result.rank}\n</source>\n</search_result>"

    inserted_prompt = """You are a question answering agent. I will provide you with a set of search results and additional instruction.
The user will provide you with a question. Your job is to answer the user's question using only information from the search results.
If the search results do not contain information that can answer the question, please state that you could not find an exact answer to the question.
Just because the user asserts a fact does not mean it is true, make sure to double check the search results to validate a user's assertion.

Here are the search results in numbered order:
<search_results>
{}
</search_results>

Here is the additional instruction:
<additional-instruction>
{}
</additional-instruction>

If you reference information from a search result within your answer, you must include a citation to source where the information was found.
Each result has a corresponding source ID that you should reference.

Note that <sources> may contain multiple <source> if you include information from multiple results in your answer.

Do NOT directly quote the <search_results> in your answer. Your job is to answer the user's question as concisely as possible.
Do NOT outputs sources at the end of your answer.

Followings are examples of how to reference sources in your answer. Note that the source ID is embedded in the answer in the format [^<source_id>].

<GOOD-example>
first answer [^3]. second answer [^1][^2].
</GOOD-example>

<GOOD-example>
first answer [^1][^5]. second answer [^2][^3][^4]. third answer [^4].
</GOOD-example>

<BAD-example>
first answer [^1].

[^1]: https://example.com
</BAD-example>

<BAD-example>
first answer [^1].

<sources>
[^1]: https://example.com
</sources>
</BAD-example>
""".format(
        context_prompt, instruction_prompt
    )
    logger.info(f"Inserted prompt: {inserted_prompt}")

    conversation_with_context = deepcopy(conversation)
    conversation_with_context.message_map["instruction"].content[
        0
    ].body = inserted_prompt

    return conversation_with_context


def get_bedrock_response(args: dict):

    client = get_bedrock_client()
    messages = args["messages"]

    logger.debug(f"model: {args['model']}")

    prompt = "\n".join(
        [
            message["content"][0]["text"]
            for message in messages
            if message["content"][0]["type"] == "text"
        ]
    )

    if is_mistral_model(args["model"]):
        prompt = f"<s>[INST] {prompt} [/INST]"

    logger.debug(f"Final Prompt: {prompt}")
    body = json.dumps(
        {
            "prompt": prompt,
            "max_tokens": args["max_tokens"],
            "temperature": args["temperature"],
            "top_p": args["top_p"],
            "top_k": args["top_k"],
        }
    )

    logger.debug(args)
    if args["stream"]:
        try:
            response = client.invoke_model_with_response_stream(
                modelId=args["model"],
                body=body,
            )
            return response.get("body")
        except Exception as e:
            logger.error(e)
    else:
        response = client.invoke_model(
            modelId=args["model"],
            body=body,
        )
        response_body = json.loads(response.get("body").read())
        logger.debug(response_body)
        return response_body


def chat(user_id: str, chat_input: ChatInput) -> ChatOutput:
    user_msg_id, conversation, bot = prepare_conversation(user_id, chat_input)

    message_map = conversation.message_map
    if bot and is_running_on_lambda():
        # NOTE: `is_running_on_lambda`is a workaround for local testing due to no postgres mock.
        # Fetch most related documents from vector store
        # NOTE: Currently embedding not support multi-modal. For now, use the last content.
        query = conversation.message_map[user_msg_id].content[-1].body
        results = search_related_docs(
            bot_id=bot.id, limit=SEARCH_CONFIG["max_results"], query=query
        )
        logger.info(f"Search results from vector store: {results}")

        # Insert contexts to instruction
        conversation_with_context = insert_knowledge(conversation, results)
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
    )
    logger.debug(args)

    if is_anthropic_model(args["model"]):
        client = get_anthropic_client()
        response: AnthropicMessage = client.messages.create(**args)
        reply_txt = response.content[0].text
    else:
        response: AnthropicMessage = get_bedrock_response(args)["outputs"][0]  # type: ignore[no-redef]
        reply_txt = response["text"]  # type: ignore

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
    )
    conversation.message_map[assistant_msg_id] = message

    # Append children to parent
    conversation.message_map[user_msg_id].children.append(assistant_msg_id)
    conversation.last_message_id = assistant_msg_id

    if is_anthropic_model(args["model"]):
        # Update total pricing
        input_tokens = response.usage.input_tokens
        output_tokens = response.usage.output_tokens

        logger.debug(f"Input tokens: {input_tokens}, Output tokens: {output_tokens}")
    else:
        input_tokens = 256
        output_tokens = 1024

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
) -> list[RelatedDocumentsOutput]:
    if not chat_input.bot_id:
        return []

    _, bot = fetch_bot(user_id, chat_input.bot_id)

    chunks = search_related_docs(
        bot_id=bot.id,
        limit=SEARCH_CONFIG["max_results"],
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
