import json
import logging
from copy import deepcopy
from datetime import datetime
from typing import Literal

from app.bedrock import _create_body, get_model_id, invoke
from app.config import SEARCH_CONFIG
from app.repositories.conversation import (
    RecordNotFoundError,
    find_conversation_by_id,
    store_conversation,
)
from app.repositories.custom_bot import find_alias_by_id, store_alias
from app.repositories.model import (
    BotAliasModel,
    BotModel,
    ContentModel,
    ConversationModel,
    MessageModel,
)
from app.route_schema import ChatInput, ChatOutput, Content, Conversation, MessageOutput
from app.usecases.bot import fetch_bot, modify_bot_last_used_time
from app.utils import get_buffer_string, get_current_time, is_running_on_lambda
from app.vector_search import SearchResult, search_related_docs
from ulid import ULID

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


def prepare_conversation(
    user_id: str, chat_input: ChatInput
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
                content=ContentModel(
                    content_type="text",
                    body="",
                ),
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
                content=ContentModel(
                    content_type="text",
                    body=bot.instruction,
                ),
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
                            has_knowledge=bot.knowledge
                            and (
                                len(bot.knowledge.source_urls) > 0
                                or len(bot.knowledge.sitemap_urls) > 0
                                or len(bot.knowledge.filenames) > 0
                            ),
                        ),
                    )

        # Create new conversation
        conversation = ConversationModel(
            id=chat_input.conversation_id,
            title="New conversation",
            create_time=current_time,
            message_map=initial_message_map,
            last_message_id="",
            bot_id=chat_input.bot_id,
        )

    # Append user chat input to the conversation
    message_id = str(ULID())
    new_message = MessageModel(
        role=chat_input.message.role,
        content=ContentModel(
            content_type=chat_input.message.content.content_type,
            body=chat_input.message.content.body,
        ),
        model=chat_input.message.model,
        children=[],
        parent=parent_id,
        create_time=current_time,
    )
    conversation.message_map[message_id] = new_message
    conversation.message_map[parent_id].children.append(message_id)  # type: ignore

    return (message_id, conversation, bot)


def get_invoke_payload(message_map: dict[str, MessageModel], chat_input: ChatInput):
    messages = trace_to_root(
        node_id=chat_input.message.parent_message_id,
        message_map=message_map,
    )
    messages.append(chat_input.message)  # type: ignore
    prompt = get_buffer_string(messages)
    body = _create_body(chat_input.message.model, prompt)
    model_id = get_model_id(chat_input.message.model)
    accept = "application/json"
    content_type = "application/json"
    return {
        "body": body,
        "model_id": model_id,
        "accept": accept,
        "content_type": content_type,
    }


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


# def compress_knowledge(query: str, results: list[SearchResult]) -> tuple[bool, str]:
#     """Compress knowledge to avoid token limit. Extract only related parts from the search results."""
#     contexts_prompt = ""
#     for result in results:
#         contexts_prompt += f"<context>\n{result.content}</context>\n"
#     NO_RELEVANT_DOC = "THERE_IS_NO_RELEVANT_DOC"
#     PROMPT = """Human: Given the following question and contexts, extract any part of the context *AS IS* that is relevant to answer the question.
# Remember, *DO NOT* edit the extracted parts of the context.
# <question>
# {}
# </question>
# <contexts>
# {}
# </contexts>
# If none of the context is relevant, just say {}.

# Assistant:
# """.format(
#         query, contexts_prompt, NO_RELEVANT_DOC
#     )
#     reply_txt = invoke(prompt=PROMPT, model="claude-instant-v1")
#     print(reply_txt)

#     if reply_txt.find(NO_RELEVANT_DOC) != -1:
#         return False, ""

#     return reply_txt


def insert_knowledge(
    conversation: ConversationModel, search_results: list[SearchResult]
) -> ConversationModel:
    """Insert knowledge to the conversation."""
    if len(search_results) == 0:
        return conversation

    context_prompt = ""
    for result in search_results:
        context_prompt += f"<context>\n{result.content}</context>\n"

    instruction_prompt = conversation.message_map["instruction"].content.body
    inserted_prompt = """You must respond based on given contexts.
The contexts are as follows:
<contexts>
{}
</contexts>
Remember, *RESPOND BASED ON THE GIVEN CONTEXTS. YOU MUST NEVER GUESS*. If you cannot find source from the contexts, just say "I don't know".
In addition, *YOU MUST OBEY THE FOLLOWING RULE*:
<rule>
{}
</rule>
""".format(
        context_prompt, instruction_prompt
    )
    logger.info(f"Inserted prompt: {inserted_prompt}")

    conversation_with_context = deepcopy(conversation)
    conversation_with_context.message_map["instruction"].content.body = inserted_prompt

    return conversation_with_context


def chat(user_id: str, chat_input: ChatInput) -> ChatOutput:
    user_msg_id, conversation, bot = prepare_conversation(user_id, chat_input)

    message_map = conversation.message_map
    if bot and is_running_on_lambda():
        # NOTE: `is_running_on_lambda`is a workaround for local testing due to no postgres mock.
        # Fetch most related documents from vector store
        query = conversation.message_map[user_msg_id].content.body
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

    # Invoke Bedrock
    prompt = get_buffer_string(messages)

    reply_txt = invoke(prompt=prompt, model=chat_input.message.model)

    # Issue id for new assistant message
    assistant_msg_id = str(ULID())
    # Append bedrock output to the existing conversation
    message = MessageModel(
        role="assistant",
        content=ContentModel(content_type="text", body=reply_txt),
        model=chat_input.message.model,
        children=[],
        parent=user_msg_id,
        create_time=get_current_time(),
    )
    conversation.message_map[assistant_msg_id] = message

    # Append children to parent
    conversation.message_map[user_msg_id].children.append(assistant_msg_id)
    conversation.last_message_id = assistant_msg_id

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
            content=Content(
                content_type=message.content.content_type,
                body=message.content.body,
            ),
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
    model: Literal["claude-instant-v1", "claude-v2"] = "claude-instant-v1",
) -> str:
    PROMPT = """Reading the conversation above, what is the appropriate title for the conversation? When answering the title, please follow the rules below:
<rules>
- Title must be in the same language as the conversation.
- Title length must be from 15 to 20 characters.
- Prefer more specific title than general. Your title should always be distinct from others.
- Return the conversation title only. DO NOT include any strings other than the title.
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
        content=ContentModel(
            content_type="text",
            body=PROMPT,
        ),
        model=model,
        children=[],
        parent=conversation.last_message_id,
        create_time=get_current_time(),
    )
    messages.append(new_message)

    # Invoke Bedrock
    prompt = get_buffer_string(messages)
    reply_txt = invoke(prompt=prompt, model=model)
    reply_txt = reply_txt.replace("\n", "")
    return reply_txt


def fetch_conversation(user_id: str, conversation_id: str) -> Conversation:
    conversation = find_conversation_by_id(user_id, conversation_id)

    message_map = {
        message_id: MessageOutput(
            role=message.role,
            content=Content(
                content_type=message.content.content_type,
                body=message.content.body,
            ),
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
