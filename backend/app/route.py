from app.repositories.conversation import (
    change_conversation_title,
    delete_conversation_by_id,
    delete_conversation_by_user_id,
    find_conversation_by_id,
    find_conversation_by_user_id,
)
from app.route_schema import (
    ChatInput,
    ChatOutput,
    Content,
    Conversation,
    ConversationMeta,
    MessageOutput,
    NewTitleInput,
    ProposedTitle,
    User,
)
from app.usecase import chat, get_invoke_payload, propose_conversation_title
from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/health")
def health():
    """ヘルスチェック用"""
    return {"status": "ok"}


@router.post("/conversation", response_model=ChatOutput)
def post_message(request: Request, chat_input: ChatInput):
    """チャットメッセージを送信する"""
    current_user: User = request.state.current_user

    output = chat(user_id=current_user.id, chat_input=chat_input)
    return output


@router.get("/conversation/{conversation_id}", response_model=Conversation)
def get_conversation(request: Request, conversation_id: str):
    """一連の会話履歴を取得する"""
    current_user: User = request.state.current_user

    conversation = find_conversation_by_id(current_user.id, conversation_id)
    output = Conversation(
        id=conversation_id,
        title=conversation.title,
        create_time=conversation.create_time,
        last_message_id=conversation.last_message_id,
        message_map={
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
        },
    )
    return output


@router.delete("/conversation/{conversation_id}")
def delete_conversation(request: Request, conversation_id: str):
    """会話履歴を削除する"""
    current_user: User = request.state.current_user

    delete_conversation_by_id(current_user.id, conversation_id)


@router.get("/conversations", response_model=list[ConversationMeta])
def get_all_conversations(
    request: Request,
):
    """すべての会話履歴のメタ情報を取得する"""
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
    """すべての会話履歴を削除する"""
    delete_conversation_by_user_id(request.state.current_user.id)


@router.patch("/conversation/{conversation_id}/title")
def update_conversation_title(
    request: Request, conversation_id: str, new_title_input: NewTitleInput
):
    """会話のタイトルを更新する"""
    current_user: User = request.state.current_user

    change_conversation_title(
        current_user.id, conversation_id, new_title_input.new_title
    )


@router.get(
    "/conversation/{conversation_id}/proposed-title", response_model=ProposedTitle
)
def get_proposed_title(request: Request, conversation_id: str):
    """会話のタイトルを提案する"""
    current_user: User = request.state.current_user

    title = propose_conversation_title(current_user.id, conversation_id)
    return ProposedTitle(title=title)
