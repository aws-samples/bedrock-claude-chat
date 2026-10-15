import logging
from typing import Callable

from app.agents.tools.agent_tool import ToolRunResult
from app.agents.utils import get_tools
from app.bedrock import (
    BedrockGuardrailsModel,
    call_converse_api,
    compose_args_for_converse_api,
    is_prefill_supported,
    is_tooluse_supported,
)
from app.prompt import build_rag_prompt, get_prompt_to_cite_tool_results
from app.repositories.conversation import (
    RecordNotFoundError,
    find_conversation_by_id,
    store_conversation,
    store_related_documents,
)
from app.repositories.conversation_search import find_conversations_by_query
from app.repositories.custom_bot import alias_exists, store_alias
from app.repositories.models.conversation import (
    ConversationModel,
    MessageModel,
    ReasoningContentModel,
    RelatedDocumentModel,
    SimpleMessageModel,
    TextContentModel,
    ToolResultContentModel,
    ToolUseContentModel,
)
from app.repositories.models.custom_bot import (
    BotAliasModel,
    BotModel,
    GenerationParamsModel,
)
from app.routes.schemas.conversation import (
    ChatInput,
    ChatOutput,
    Chunk,
    Conversation,
    ConversationSearchResult,
    FeedbackOutput,
    MessageOutput,
    SearchHighlight,
    type_model_name,
)
from app.stream import ConverseApiStreamHandler, OnStopInput, OnThinking
from app.usecases.bot import fetch_bot, modify_bot_last_used_time, modify_bot_stats
from app.usecases.global_config import get_title_model
from app.user import User
from app.utils import get_current_time
from app.vector_search import (
    SearchResult,
    search_related_docs,
    search_result_to_related_document,
)
from typing_extensions import deprecated
from ulid import ULID

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def prepare_conversation(
    user: User,
    chat_input: ChatInput,
) -> tuple[str, ConversationModel, BotModel | None]:
    current_time = get_current_time()
    bot = None

    try:
        # Fetch existing conversation
        conversation = find_conversation_by_id(user.id, chat_input.conversation_id)
        logger.info(f"Found conversation: {conversation}")
        parent_id = chat_input.message.parent_message_id
        if chat_input.message.parent_message_id == "system" and chat_input.bot_id:
            # The case editing first user message and use bot
            parent_id = "instruction"
        elif chat_input.message.parent_message_id is None:
            parent_id = conversation.last_message_id
        if chat_input.bot_id:
            logger.info("Bot id is provided. Fetching bot.")
            owned, bot = fetch_bot(user, chat_input.bot_id)
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
                    TextContentModel(
                        content_type="text",
                        body="",
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
            owned, bot = fetch_bot(user, chat_input.bot_id)
            initial_message_map["instruction"] = MessageModel(
                role="instruction",
                content=[
                    TextContentModel(
                        content_type="text",
                        body=bot.instruction,
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
                    alias_exists(user.id, chat_input.bot_id)
                except RecordNotFoundError:
                    logger.info(
                        "Bot is not owned by the user. Creating alias to shared bot."
                    )
                    # Create alias item
                    store_alias(user.id, BotAliasModel.from_bot_for_initial_alias(bot))

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
    if not chat_input.continue_generate:
        new_message = MessageModel.from_message_input(chat_input.message)
        new_message.parent = parent_id
        new_message.create_time = current_time

        if chat_input.message.message_id:
            message_id = chat_input.message.message_id
        else:
            message_id = str(ULID())

        conversation.message_map[message_id] = new_message
        conversation.message_map[parent_id].children.append(message_id)  # type: ignore

    # If the "Generate continue" button is pressed, a new_message is not generated.
    else:
        message_id = (
            conversation.message_map[conversation.last_message_id].parent
            or "instruction"
        )

    return (message_id, conversation, bot)


def trace_to_root(
    node_id: str | None, message_map: dict[str, MessageModel]
) -> list[SimpleMessageModel]:
    """Trace message map from leaf node to root node."""
    result: list[SimpleMessageModel] = []
    if not node_id or node_id == "system":
        node_id = "instruction" if "instruction" in message_map else "system"

    current_node = message_map.get(node_id)
    while current_node:
        result.append(SimpleMessageModel.from_message_model(message=current_node))
        if current_node.thinking_log:
            result.extend(
                log
                for log in reversed(current_node.thinking_log)
                if any(
                    isinstance(content, ToolUseContentModel)
                    or isinstance(content, ToolResultContentModel)
                    for content in log.content
                )
            )

        parent_id = current_node.parent
        if parent_id is None:
            break
        current_node = message_map.get(parent_id)

    return result[::-1]


def chat(
    user: User,
    chat_input: ChatInput,
    on_stream: Callable[[str], None] | None = None,
    on_stop: Callable[[OnStopInput], None] | None = None,
    on_thinking: Callable[[OnThinking], None] | None = None,
    on_tool_result: Callable[[ToolRunResult], None] | None = None,
    on_reasoning: Callable[[str], None] | None = None,
) -> tuple[ConversationModel, MessageModel]:
    user_msg_id, conversation, bot = prepare_conversation(user, chat_input)
    display_citation = bot is not None and bot.display_retrieved_chunks

    message_map = conversation.message_map
    instructions: list[str] = (
        [
            content.body
            for content in message_map["instruction"].content
            if isinstance(content, TextContentModel)
        ]
        if "instruction" in message_map
        else []
    )

    related_documents: list[RelatedDocumentModel] = []
    search_results: list[SearchResult] = []
    if bot is not None:
        if bot.is_agent_enabled() and is_tooluse_supported(chat_input.message.model):
            if display_citation:
                instructions.append(
                    get_prompt_to_cite_tool_results(
                        model=chat_input.message.model,
                    )
                )
        elif bot.has_knowledge() and not is_tooluse_supported(chat_input.message.model):
            # Fetch most related documents from vector store
            # NOTE: Currently embedding not support multi-modal. For now, use the last content.
            content = conversation.message_map[user_msg_id].content[-1]
            if isinstance(content, TextContentModel):
                pseudo_tool_use_id = "new-message-assistant"

                if on_thinking:
                    on_thinking(
                        {
                            "tool_use_id": pseudo_tool_use_id,
                            "name": "knowledge_base_tool",
                            "input": {
                                "query": content.body,
                            },
                        }
                    )

                search_results = search_related_docs(bot=bot, query=content.body)
                logger.info(f"Search results from vector store: {search_results}")

                if on_tool_result:
                    on_tool_result(
                        {
                            "tool_use_id": pseudo_tool_use_id,
                            "status": "success",
                            "related_documents": [
                                search_result_to_related_document(
                                    search_result=result,
                                    source_id_base=pseudo_tool_use_id,
                                )
                                for result in search_results
                            ],
                        }
                    )

                # Insert contexts to instruction
                instructions.append(
                    build_rag_prompt(
                        search_results=search_results,
                        model=chat_input.message.model,
                        display_citation=display_citation,
                    )
                )

    # Leaf node id
    # If `continue_generate` is True, note that new message is not added to the message map.
    node_id = (
        chat_input.message.parent_message_id
        if chat_input.continue_generate
        else message_map[user_msg_id].parent
    )
    if node_id is None:
        raise ValueError("parent_message_id or parent is None")

    messages = trace_to_root(
        node_id=node_id,
        message_map=message_map,
    )

    if chat_input.continue_generate:
        message_for_continue_generate = SimpleMessageModel.from_message_model(
            message=message_map[conversation.last_message_id],
        )

    else:
        messages.append(
            SimpleMessageModel.from_message_model(message=message_map[user_msg_id]),
        )
        message_for_continue_generate = None

    generation_params = bot.generation_params if bot else None

    # Guardrails
    guardrail = bot.bedrock_guardrails if bot else None

    def on_tool_run_result(run_result: ToolRunResult):
        if run_result["status"] == "success":
            related_documents.extend(run_result["related_documents"])

        if on_tool_result:
            on_tool_result(run_result)

    """
    Routes to Strands or legacy implementation based on USE_STRANDS environment variable.
    """
    import os

    use_strands = os.environ.get("USE_STRANDS", "true").lower() == "true"

    if use_strands:
        from app.strands_integration.chat_strands import converse_with_strands

        result = converse_with_strands(
            bot=bot,
            chat_input=chat_input,
            instructions=instructions,
            generation_params=generation_params,
            guardrail=guardrail,
            display_citation=display_citation,
            messages=messages,
            search_results=search_results,
            on_stream=on_stream,
            on_thinking=on_thinking,
            on_tool_result=on_tool_run_result,
            on_reasoning=on_reasoning,
        )

    else:
        result = converse_legacy(
            bot=bot,
            chat_input=chat_input,
            instructions=instructions,
            generation_params=generation_params,
            guardrail=guardrail,
            display_citation=display_citation,
            messages=messages,
            search_results=search_results,
            on_stream=on_stream,
            on_thinking=on_thinking,
            on_tool_result=on_tool_run_result,
            on_reasoning=on_reasoning,
        )

    # Post handling: process the result and update conversation
    return post_process_result(
        result=result,
        message_for_continue_generate=message_for_continue_generate,
        conversation=conversation,
        user_msg_id=user_msg_id,
        bot=bot,
        user=user,
        chat_input=chat_input,
        search_results=search_results,
        related_documents=related_documents,
        on_stop=on_stop,
    )


@deprecated("Use chat() instead")
def converse_legacy(
    bot: BotModel | None,
    chat_input: ChatInput,
    instructions: list[str],
    generation_params: GenerationParamsModel | None,
    guardrail: BedrockGuardrailsModel | None,
    display_citation: bool,
    messages: list[SimpleMessageModel],
    search_results: list[SearchResult],
    on_stream: Callable[[str], None] | None = None,
    on_thinking: Callable[[OnThinking], None] | None = None,
    on_tool_result: Callable[[ToolRunResult], None] | None = None,
    on_reasoning: Callable[[str], None] | None = None,
) -> OnStopInput:
    """
    Legacy converse implementation.

    WARNING: This implementation is deprecated and will be removed in a future version.
    Please migrate to the Strands-based implementation by setting USE_STRANDS=true.
    """
    tools = get_tools(bot, chat_input.message.model)
    stream_handler = ConverseApiStreamHandler(
        model=chat_input.message.model,
        instructions=instructions,
        generation_params=generation_params,
        guardrail=guardrail,
        tools=tools,
        on_stream=on_stream,
        on_thinking=on_thinking,
        on_reasoning=on_reasoning,
    )

    thinking_log: list[SimpleMessageModel] = []

    continue_generate = chat_input.continue_generate
    input_token_count = 0
    output_token_count = 0
    cache_read_input_count = 0
    cache_write_input_count = 0
    price = 0.0

    while True:
        result: OnStopInput = stream_handler.run(
            messages=messages,
            search_results=search_results,
            enable_reasoning=chat_input.enable_reasoning,
            prompt_caching_enabled=(
                bot.prompt_caching_enabled if bot is not None else True
            ),
        )

        message = result["message"]
        stop_reason = result["stop_reason"]

        input_token_count += result["input_token_count"]
        output_token_count += result["output_token_count"]
        cache_read_input_count += result["cache_read_input_count"]
        cache_write_input_count += result["cache_write_input_count"]
        price += result["price"]

        if stop_reason != "tool_use":  # Tool use converged
            # Retain tool use and its result logs
            tool_logs = [
                log
                for log in thinking_log
                if any(
                    isinstance(content, (ToolUseContentModel, ToolResultContentModel))
                    for content in log.content
                )
            ]
            if tool_logs:
                message.thinking_log = tool_logs

            return OnStopInput(
                message=message,
                stop_reason=stop_reason,
                input_token_count=input_token_count,
                output_token_count=output_token_count,
                cache_read_input_count=cache_read_input_count,
                cache_write_input_count=cache_write_input_count,
                price=price,
            )

        tool_use_message = SimpleMessageModel.from_message_model(message=message)
        if continue_generate:
            messages[-1] = tool_use_message

            continue_generate = False

        else:
            messages.append(tool_use_message)

        thinking_log.append(tool_use_message)

        tool_use_contents = [
            content
            for content in tool_use_message.content
            if isinstance(content, ToolUseContentModel)
        ]

        run_results: list[ToolRunResult] = []
        for content in tool_use_contents:
            tool = tools[content.body.name]
            run_result = tool.run(
                tool_use_id=content.body.tool_use_id,
                input=content.body.input,
                model=chat_input.message.model,
                bot=bot,
            )
            run_results.append(run_result)

            if on_tool_result:
                on_tool_result(run_result)

        tool_result_message = SimpleMessageModel(
            role="user",
            content=[
                ToolResultContentModel.from_tool_run_result(
                    run_result=result,
                    model=chat_input.message.model,
                    display_citation=display_citation,
                )
                for result in run_results
            ],
        )
        messages.append(tool_result_message)
        thinking_log.append(tool_result_message)


def post_process_result(
    result: OnStopInput,
    message_for_continue_generate: SimpleMessageModel | None,
    conversation: ConversationModel,
    user_msg_id: str,
    bot: BotModel | None,
    user: User,
    chat_input: ChatInput,
    search_results: list[SearchResult],
    related_documents: list[RelatedDocumentModel],
    on_stop: Callable[[OnStopInput], None] | None = None,
):
    """Post-process OnStopInput and update conversation."""

    message = result["message"]
    stop_reason = result["stop_reason"]

    conversation.total_price += result["price"]
    conversation.should_continue = stop_reason == "max_tokens" and is_prefill_supported(
        chat_input.message.model
    )

    # Set message parent and generate assistant message ID
    message.parent = user_msg_id

    # Generate assistant message ID
    if chat_input.continue_generate and not message.thinking_log:
        if message_for_continue_generate is not None:
            message.continue_from(message_for_continue_generate)

        assistant_msg_id = conversation.last_message_id
        conversation.message_map[assistant_msg_id] = message

    else:
        if chat_input.continue_generate and message.thinking_log:
            if message_for_continue_generate is not None:
                message.thinking_log[0].continue_from(message_for_continue_generate)

            # Remove old assistant message and create new one
            old_assistant_msg_id = conversation.last_message_id
            conversation.message_map[user_msg_id].children.remove(old_assistant_msg_id)
            del conversation.message_map[old_assistant_msg_id]

        # Issue id for new assistant message
        assistant_msg_id = str(ULID())
        conversation.message_map[assistant_msg_id] = message

        # Append children to parent
        conversation.message_map[user_msg_id].children.append(assistant_msg_id)
        conversation.last_message_id = assistant_msg_id

        # Create related documents with consistent source_id format
        search_results_as_related_documents = [
            search_result_to_related_document(
                search_result=result,
                source_id_base=assistant_msg_id,
            )
            for result in search_results
        ]

        # Store RAG results in ToolResultCapture for citation support
        related_documents.extend(search_results_as_related_documents)

    # Store conversation before finish streaming so that front-end can avoid 404 issue
    store_conversation(user.id, conversation)
    if related_documents:
        store_related_documents(
            user_id=user.id,
            conversation_id=conversation.id,
            related_documents=related_documents,
        )

    # Call on_stop callback
    if on_stop:
        on_stop(result)

    # Update bot statistics
    if bot:
        logger.debug("Bot is provided. Updating bot last used time.")
        # Update bot last used time
        modify_bot_last_used_time(user, bot)
        # Update bot stats
        modify_bot_stats(user, bot, increment=1)

    return conversation, message


def chat_output_from_message(
    conversation: ConversationModel,
    message: MessageModel,
) -> ChatOutput:
    return ChatOutput(
        conversation_id=conversation.id,
        create_time=conversation.create_time,
        message=MessageOutput(
            role=message.role,
            content=[c.to_content() for c in message.content],
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
            thinking_log=(
                [m.to_schema() for m in message.thinking_log]
                if message.thinking_log
                else None
            ),
        ),
        bot_id=conversation.bot_id,
    )


def propose_conversation_title(
    user_id: str,
    conversation_id: str,
) -> str:
    # Use the configured title model for generating conversation titles
    model = get_title_model()

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
    new_message = SimpleMessageModel(
        role="user",
        content=[
            TextContentModel(
                content_type="text",
                body=PROMPT,
            )
        ],
    )
    messages.append(new_message)

    # Invoke Bedrock
    args = compose_args_for_converse_api(
        messages=[
            message
            for message in messages
            if not any(
                isinstance(content, ToolUseContentModel)
                or isinstance(content, ToolResultContentModel)
                or isinstance(content, ReasoningContentModel)
                for content in message.content
            )
        ],
        model=model,
        stream=False,
    )
    response = call_converse_api(args)
    # Reasoning models (e.g. GPT-OSS) put a reasoningContent block before the text
    reply_txt = (
        next(
            (
                c["text"]
                for c in response["output"]["message"]["content"]
                if "text" in c
            ),
            "",
        )
        if "message" in response["output"]
        else ""
    )

    return reply_txt


def fetch_conversation(user_id: str, conversation_id: str) -> Conversation:
    conversation = find_conversation_by_id(user_id, conversation_id)

    message_map = {
        message_id: MessageOutput(
            role=message.role,
            content=[c.to_content() for c in message.content],
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
            thinking_log=(
                [m.to_schema() for m in message.thinking_log]
                if message.thinking_log
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


def search_conversations(query: str, user: User) -> list[ConversationSearchResult]:
    """Search conversations by keyword"""
    conversations = find_conversations_by_query(query, user)
    output = []

    for conversation in conversations:
        # Convert model SearchHighlightModel to schema SearchHighlight
        schema_highlights = None
        if conversation.highlights:
            schema_highlights = [
                SearchHighlight(
                    field_name=highlight.field_name, fragments=highlight.fragments
                )
                for highlight in conversation.highlights
            ]

        # Create ConversationSearchResult with properly converted highlights
        output.append(
            ConversationSearchResult(
                id=conversation.id,
                title=conversation.title,
                last_updated_time=conversation.last_updated_time,
                bot_id=conversation.bot_id,
                highlights=schema_highlights,
            )
        )

    return output
