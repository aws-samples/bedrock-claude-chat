from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from repositories.conversation import (
    change_conversation_title,
    delete_conversation_by_id,
    delete_conversation_by_user_id,
    find_conversation_by_id,
    find_conversation_by_user_id,
)
from schema import (
    ChatInput,
    ChatOutput,
    Content,
    Conversation,
    ConversationMeta,
    MessageOutput,
    NewTitleInput,
    User,
    ProposedTitle,
)
from usecase import chat, chat_stream, propose_conversation_title

router = APIRouter()


@router.get("/health")
def health():
    """ヘルスチェック用
    """
    return {"status": "ok"}


@router.post("/conversation", response_model=ChatOutput)
def post_message(request: Request, chat_input: ChatInput):
    """チャットメッセージを送信する
    """
    current_user: User = request.state.current_user

    if chat_input.stream:
        stream = chat_stream(user_id=current_user.id, chat_input=chat_input)
        return StreamingResponse(stream, media_type="text/event-stream")
    else:
        output = chat(user_id=current_user.id, chat_input=chat_input)
        return output


@router.get("/conversation/{conversation_id}", response_model=Conversation)
def get_conversation(conversation_id: str):
    """一連の会話履歴を取得する
    """
    conversation = find_conversation_by_id(conversation_id)
    output = Conversation(
        id=conversation_id,
        title=conversation.title,
        create_time=conversation.create_time,
        messages=[
            MessageOutput(
                id=message.id,
                role=message.role,
                content=Content(
                    content_type=message.content.content_type,
                    body=message.content.body,
                ),
                model=message.model,
            )
            for message in conversation.messages
        ],
    )
    return output


@router.delete("/conversation/{conversation_id}")
def delete_conversation(conversation_id: str):
    """会話履歴を削除する
    """
    delete_conversation_by_id(conversation_id)


@router.get("/conversations", response_model=list[ConversationMeta])
def get_all_conversations(
    request: Request,
):
    """すべての会話履歴のメタ情報を取得する
    """
    current_user: User = request.state.current_user

    conversations = find_conversation_by_user_id(current_user.id)
    output = [
        ConversationMeta(
            id=conversation.id,
            title=conversation.title,
            create_time=conversation.create_time,
        )
        for conversation in conversations
    ]
    return output


@router.delete("/conversations")
def delete_all_conversations(
    request: Request,
):
    """すべての会話履歴を削除する
    """
    delete_conversation_by_user_id(request.state.current_user.id)


@router.patch("/conversation/{conversation_id}/title")
def update_conversation_title(conversation_id: str, new_title_input: NewTitleInput):
    """会話のタイトルを更新する
    """
    change_conversation_title(conversation_id, new_title_input.new_title)

@router.get("/conversation/{conversation_id}/proposed-title", response_model=ProposedTitle)
def get_proposed_title(conversation_id: str):
    """会話のタイトルを提案する
    """
    title = propose_conversation_title(conversation_id)
    return ProposedTitle(title=title)