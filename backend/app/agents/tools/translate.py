from app.bedrock import compose_args, get_bedrock_response
from app.repositories.models.conversation import ContentModel, MessageModel
from app.utils import get_anthropic_client, get_current_time, is_anthropic_model
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_core.tools import StructuredTool


class TranslationInput(BaseModel):
    text: str = Field(description="The text to translate")
    target_lang: str = Field(
        description="The target language to translate to (e.g. 'Japanese', 'English', 'Chinese')"
    )


def translate_text(text: str, target_lang: str) -> str:
    PROMPT = (
        f"""You are a translation tool. Translate the given text into {target_lang}."""
    )
    model = "claude-v3-haiku"
    message = MessageModel(
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
        parent=None,
        create_time=get_current_time(),
        feedback=None,
        used_chunks=None,
    )
    args = compose_args(
        messages=[message],
        model=model,
    )
    if is_anthropic_model(args["model"]):
        client = get_anthropic_client()
        response = client.messages.create(**args)
        reply_txt = response.content[0].text
    else:
        response: AnthropicMessage = get_bedrock_response(args)["outputs"][0]  # type: ignore[no-redef]
        reply_txt = response["text"]
    return reply_txt


translation_tool = StructuredTool.from_function(
    func=translate_text,
    name="Translator",
    description="Translate the given text into the specified target language using an LLM",
    args_schema=TranslationInput,
)
