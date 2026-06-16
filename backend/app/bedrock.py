from __future__ import annotations

import logging
import os
from typing import (
    TYPE_CHECKING,
    Any,
    Literal,
    NotRequired,
    Optional,
    TypedDict,
    TypeGuard,
)

from app.config import (
    BEDROCK_PRICING,
    DEFAULT_DEEP_SEEK_GENERATION_CONFIG,
    DEFAULT_GENERATION_CONFIG,
    DEFAULT_LLAMA_GENERATION_CONFIG,
    DEFAULT_MISTRAL_GENERATION_CONFIG,
    DEFAULT_QWEN_GENERATION_CONFIG,
)
from app.repositories.models.custom_bot import GenerationParamsModel
from app.repositories.models.custom_bot_guardrails import BedrockGuardrailsModel
from app.routes.schemas.conversation import type_model_name
from app.utils import get_bedrock_runtime_client
from app.vector_search import SearchResult

from botocore.exceptions import ClientError
from reretry import retry
from typing_extensions import deprecated

if TYPE_CHECKING:
    from app.agents.tools.agent_tool import AgentTool
    from app.repositories.models.conversation import ContentModel, SimpleMessageModel
    from mypy_boto3_bedrock_runtime.literals import ConversationRoleType
    from mypy_boto3_bedrock_runtime.type_defs import (
        ContentBlockTypeDef,
        ConverseResponseTypeDef,
        ConverseStreamRequestTypeDef,
        GuardrailConverseContentBlockTypeDef,
        MessageTypeDef,
        SystemContentBlockTypeDef,
        ToolTypeDef,
    )


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

BEDROCK_REGION = os.environ.get("BEDROCK_REGION", "us-east-1")
ENABLE_BEDROCK_GLOBAL_INFERENCE = (
    os.environ.get("ENABLE_BEDROCK_GLOBAL_INFERENCE", "false") == "true"
)
ENABLE_BEDROCK_CROSS_REGION_INFERENCE = (
    os.environ.get("ENABLE_BEDROCK_CROSS_REGION_INFERENCE", "false") == "true"
)

# Base model IDs mapping
BASE_MODEL_IDS = {
    "claude-v4-opus": "anthropic.claude-opus-4-20250514-v1:0",
    "claude-v4.1-opus": "anthropic.claude-opus-4-1-20250805-v1:0",
    "claude-v4.5-opus": "anthropic.claude-opus-4-5-20251101-v1:0",
    "claude-v4.6-opus": "anthropic.claude-opus-4-6-v1",
    "claude-v4.7-opus": "anthropic.claude-opus-4-7",
    "claude-v4-sonnet": "anthropic.claude-sonnet-4-20250514-v1:0",
    "claude-v4.5-sonnet": "anthropic.claude-sonnet-4-5-20250929-v1:0",
    "claude-v4.6-sonnet": "anthropic.claude-sonnet-4-6",
    "claude-v4.5-haiku": "anthropic.claude-haiku-4-5-20251001-v1:0",
    "claude-v3-haiku": "anthropic.claude-3-haiku-20240307-v1:0",
    "claude-v3-opus": "anthropic.claude-3-opus-20240229-v1:0",
    "claude-v3.5-sonnet": "anthropic.claude-3-5-sonnet-20240620-v1:0",
    "claude-v3.5-sonnet-v2": "anthropic.claude-3-5-sonnet-20241022-v2:0",
    "claude-v3.7-sonnet": "anthropic.claude-3-7-sonnet-20250219-v1:0",
    "claude-v3.5-haiku": "anthropic.claude-3-5-haiku-20241022-v1:0",
    "mistral-7b-instruct": "mistral.mistral-7b-instruct-v0:2",
    "mixtral-8x7b-instruct": "mistral.mixtral-8x7b-instruct-v0:1",
    "mistral-large": "mistral.mistral-large-2402-v1:0",
    "mistral-large-2": "mistral.mistral-large-2407-v1:0",
    "amazon-nova-pro": "amazon.nova-pro-v1:0",
    "amazon-nova-lite": "amazon.nova-lite-v1:0",
    "amazon-nova-micro": "amazon.nova-micro-v1:0",
    "deepseek-r1": "deepseek.r1-v1:0",
    "llama3-3-70b-instruct": "meta.llama3-3-70b-instruct-v1:0",
    "llama3-2-1b-instruct": "meta.llama3-2-1b-instruct-v1:0",
    "llama3-2-3b-instruct": "meta.llama3-2-3b-instruct-v1:0",
    "llama3-2-11b-instruct": "meta.llama3-2-11b-instruct-v1:0",
    "llama3-2-90b-instruct": "meta.llama3-2-90b-instruct-v1:0",
    # OpenAI GPT-OSS models
    "gpt-oss-20b": "openai.gpt-oss-20b-1:0",
    "gpt-oss-120b": "openai.gpt-oss-120b-1:0",
    # Qwen3 models
    "qwen3-235b-a22b-2507": "qwen.qwen3-235b-a22b-2507-v1:0",
}

# Global inference profiles
GLOBAL_INFERENCE_PROFILES = {
    "claude-v4.5-opus": {
        "supported_regions": [
            "us-west-2",
            "us-west-1",
            "us-east-2",
            "us-east-1",
            "sa-east-1",
            "eu-west-3",
            "eu-west-2",
            "eu-west-1",
            "eu-south-2",
            "eu-south-1",
            "eu-north-1",
            "eu-central-2",
            "eu-central-1",
            "ca-central-1",
            "ap-southeast-4",
            "ap-southeast-3",
            "ap-southeast-2",
            "ap-southeast-1",
            "ap-south-2",
            "ap-south-1",
            "ap-northeast-3",
            "ap-northeast-2",
            "ap-northeast-1",
        ]
    },
    "claude-v4.6-opus": {
        "supported_regions": [
            "us-west-2",
            "us-west-1",
            "us-east-2",
            "us-east-1",
            "sa-east-1",
            "eu-west-3",
            "eu-west-2",
            "eu-west-1",
            "eu-south-2",
            "eu-south-1",
            "eu-north-1",
            "eu-central-2",
            "eu-central-1",
            "ca-central-1",
            "ap-southeast-4",
            "ap-southeast-3",
            "ap-southeast-2",
            "ap-southeast-1",
            "ap-south-2",
            "ap-south-1",
            "ap-northeast-3",
            "ap-northeast-2",
            "ap-northeast-1",
        ]
    },
    "claude-v4.6-sonnet": {
        "supported_regions": [
            "us-west-2",
            "us-west-1",
            "us-east-2",
            "us-east-1",
            "sa-east-1",
            "eu-west-3",
            "eu-west-2",
            "eu-west-1",
            "eu-south-2",
            "eu-south-1",
            "eu-north-1",
            "eu-central-2",
            "eu-central-1",
            "ca-central-1",
            "ap-southeast-4",
            "ap-southeast-3",
            "ap-southeast-2",
            "ap-southeast-1",
            "ap-south-2",
            "ap-south-1",
            "ap-northeast-3",
            "ap-northeast-2",
            "ap-northeast-1",
        ]
    },
    "claude-v4.7-opus": {
        "supported_regions": [
            "us-west-2",
            "us-west-1",
            "us-east-2",
            "us-east-1",
            "sa-east-1",
            "eu-west-3",
            "eu-west-2",
            "eu-west-1",
            "eu-south-2",
            "eu-south-1",
            "eu-north-1",
            "eu-central-2",
            "eu-central-1",
            "ca-central-1",
            "ca-west-1",
            "ap-southeast-4",
            "ap-southeast-3",
            "ap-southeast-2",
            "ap-southeast-1",
            "ap-south-2",
            "ap-south-1",
            "ap-northeast-3",
            "ap-northeast-2",
            "ap-northeast-1",
        ]
    },
    "claude-v4-sonnet": {
        "supported_regions": [
            "us-west-2",
            "us-east-1",
            "us-east-2",
            "eu-west-1",
            "ap-northeast-1",
        ]
    },
    "claude-v4.5-sonnet": {
        "supported_regions": [
            "us-west-2",
            "us-west-1",
            "us-east-2",
            "us-east-1",
            "sa-east-1",
            "eu-west-3",
            "eu-west-2",
            "eu-west-1",
            "eu-south-2",
            "eu-south-1",
            "eu-north-1",
            "eu-central-2",
            "eu-central-1",
            "ca-central-1",
            "ap-southeast-4",
            "ap-southeast-3",
            "ap-southeast-2",
            "ap-southeast-1",
            "ap-south-2",
            "ap-south-1",
            "ap-northeast-3",
            "ap-northeast-2",
            "ap-northeast-1",
        ]
    },
    "claude-v4.5-haiku": {
        "supported_regions": [
            "us-west-2",
            "us-west-1",
            "us-east-2",
            "us-east-1",
            "sa-east-1",
            "eu-west-3",
            "eu-west-2",
            "eu-west-1",
            "eu-south-2",
            "eu-south-1",
            "eu-north-1",
            "eu-central-2",
            "eu-central-1",
            "ca-central-1",
            "ap-southeast-4",
            "ap-southeast-3",
            "ap-southeast-2",
            "ap-southeast-1",
            "ap-south-2",
            "ap-south-1",
            "ap-northeast-3",
            "ap-northeast-2",
            "ap-northeast-1",
        ]
    },
}

# Regional inference profiles
REGIONAL_INFERENCE_PROFILES = {
    "claude-v4-opus": {
        "supported_regions": {"us-east-1": "us", "us-east-2": "us", "us-west-2": "us"}
    },
    "claude-v4.1-opus": {
        "supported_regions": {"us-east-1": "us", "us-east-2": "us", "us-west-2": "us"}
    },
    # "claude-v4.5-opus" only available on global endpoint
    "claude-v4.7-opus": {
        "supported_regions": {
            "us-east-1": "us",
            "us-east-2": "us",
            "us-west-1": "us",
            "us-west-2": "us",
            "ca-central-1": "us",
            "ca-west-1": "us",
            "eu-central-1": "eu",
            "eu-central-2": "eu",
            "eu-north-1": "eu",
            "eu-south-1": "eu",
            "eu-south-2": "eu",
            "eu-west-1": "eu",
            "eu-west-2": "eu",
            "eu-west-3": "eu",
            "ap-northeast-1": "jp",
            "ap-northeast-3": "jp",
            "ap-southeast-2": "au",
            "ap-southeast-4": "au",
        }
    },
    "claude-v4.6-opus": {
        "supported_regions": {
            "us-east-1": "us",
            "us-east-2": "us",
            "us-west-1": "us",
            "us-west-2": "us",
            "ca-central-1": "us",
            "eu-central-1": "eu",
            "eu-central-2": "eu",
            "eu-north-1": "eu",
            "eu-south-1": "eu",
            "eu-south-2": "eu",
            "eu-west-1": "eu",
            "eu-west-2": "eu",
            "eu-west-3": "eu",
            "ap-southeast-2": "au",
            "ap-southeast-4": "au",
        }
    },
    "claude-v4.6-sonnet": {
        "supported_regions": {
            "us-east-1": "us",
            "us-east-2": "us",
            "us-west-1": "us",
            "us-west-2": "us",
            "ca-central-1": "us",
            "eu-central-1": "eu",
            "eu-central-2": "eu",
            "eu-north-1": "eu",
            "eu-south-1": "eu",
            "eu-south-2": "eu",
            "eu-west-1": "eu",
            "eu-west-2": "eu",
            "eu-west-3": "eu",
            "ap-southeast-2": "au",
            "ap-southeast-4": "au",
        }
    },
    "claude-v4-sonnet": {
        "supported_regions": {
            "us-east-1": "us",
            "us-east-2": "us",
            "us-west-2": "us",
            "eu-central-1": "eu",
            "eu-west-1": "eu",
            "eu-west-3": "eu",
            "ap-south-1": "apac",
            "ap-northeast-1": "apac",
            "ap-northeast-2": "apac",
            "ap-southeast-1": "apac",
            "ap-southeast-2": "apac",
        }
    },
    "claude-v4.5-sonnet": {
        "supported_regions": {
            "us-east-1": "us",
            "us-east-2": "us",
            "us-west-1": "us",
            "us-west-2": "us",
            "eu-central-1": "eu",
            "eu-north-1": "eu",
            "eu-west-1": "eu",
            "eu-west-2": "eu",
            "eu-west-3": "eu",
            "eu-south-1": "eu",
            "eu-south-2": "eu",
            "ap-northeast-1": "jp",
            "ap-northeast-3": "jp",
        }
    },
    "claude-v4.5-haiku": {
        "supported_regions": {
            "us-east-1": "us",
            "us-east-2": "us",
            "us-west-1": "us",
            "us-west-2": "us",
            "ap-northeast-1": "jp",
            "ap-northeast-3": "jp",
            "eu-central-1": "eu",
            "eu-central-2": "eu",
            "eu-north-1": "eu",
            "eu-west-1": "eu",
            "eu-west-3": "eu",
            "eu-south-1": "eu",
            "eu-south-2": "eu",
        }
    },
    "claude-v3-haiku": {
        "supported_regions": {
            "us-east-1": "us",
            "us-east-2": "us",
            "us-west-2": "us",
            "eu-central-1": "eu",
            "eu-west-1": "eu",
            "eu-west-3": "eu",
            "ap-south-1": "apac",
            "ap-northeast-1": "apac",
            "ap-northeast-2": "apac",
            "ap-southeast-1": "apac",
            "ap-southeast-2": "apac",
        }
    },
    "claude-v3-opus": {"supported_regions": {"us-east-1": "us", "us-west-2": "us"}},
    "claude-v3.5-sonnet": {
        "supported_regions": {
            "us-east-1": "us",
            "us-east-2": "us",
            "us-west-2": "us",
            "eu-central-1": "eu",
            "eu-west-1": "eu",
            "eu-west-3": "eu",
            "ap-south-1": "apac",
            "ap-northeast-1": "apac",
            "ap-northeast-2": "apac",
            "ap-southeast-1": "apac",
            "ap-southeast-2": "apac",
        }
    },
    "claude-v3.5-sonnet-v2": {
        "supported_regions": {
            "us-east-1": "us",
            "us-east-2": "us",
            "us-west-2": "us",
            "ap-south-1": "apac",
            "ap-northeast-1": "apac",
            "ap-northeast-2": "apac",
            "ap-northeast-3": "apac",
            "ap-southeast-1": "apac",
            "ap-southeast-2": "apac",
        }
    },
    "claude-v3.7-sonnet": {
        "supported_regions": {
            "us-east-1": "us",
            "us-east-2": "us",
            "us-west-2": "us",
            "eu-central-1": "eu",
            "eu-west-1": "eu",
            "eu-west-3": "eu",
        }
    },
    "claude-v3.5-haiku": {
        "supported_regions": {"us-east-1": "us", "us-east-2": "us", "us-west-2": "us"}
    },
    "amazon-nova-pro": {
        "supported_regions": {
            "us-east-1": "us",
            "us-east-2": "us",
            "us-west-1": "us",
            "us-west-2": "us",
            "eu-central-1": "eu",
            "eu-west-1": "eu",
            "eu-west-3": "eu",
            "eu-north-1": "eu",
            "ap-south-1": "apac",
            "ap-northeast-1": "apac",
            "ap-northeast-2": "apac",
            "ap-southeast-1": "apac",
            "ap-southeast-2": "apac",
        }
    },
    "amazon-nova-lite": {
        "supported_regions": {
            "us-east-2": "us",
            "us-west-1": "us",
            "us-west-2": "us",
            "eu-central-1": "eu",
            "eu-west-1": "eu",
            "eu-west-3": "eu",
            "eu-north-1": "eu",
            "ap-south-1": "apac",
            "ap-northeast-1": "apac",
            "ap-northeast-2": "apac",
            "ap-southeast-1": "apac",
            "ap-southeast-2": "apac",
        }
    },
    "amazon-nova-micro": {
        "supported_regions": {
            "us-east-2": "us",
            "us-west-2": "us",
            "eu-north-1": "eu",
            "ap-south-1": "apac",
            "ap-northeast-1": "apac",
            "ap-northeast-2": "apac",
            "ap-southeast-1": "apac",
            "ap-southeast-2": "apac",
        }
    },
    "deepseek-r1": {
        "supported_regions": {"us-east-1": "us", "us-east-2": "us", "us-west-2": "us"}
    },
    "llama3-3-70b-instruct": {
        "supported_regions": {"us-east-1": "us", "us-east-2": "us", "us-west-2": "us"}
    },
    "llama3-2-1b-instruct": {
        "supported_regions": {
            "us-east-1": "us",
            "us-east-2": "us",
            "us-west-2": "us",
            "eu-central-1": "eu",
            "eu-west-1": "eu",
            "eu-west-3": "eu",
        }
    },
    "llama3-2-3b-instruct": {
        "supported_regions": {
            "us-east-1": "us",
            "us-east-2": "us",
            "us-west-2": "us",
            "eu-central-1": "eu",
            "eu-west-1": "eu",
            "eu-west-3": "eu",
        }
    },
    "llama3-2-11b-instruct": {
        "supported_regions": {"us-east-1": "us", "us-east-2": "us", "us-west-2": "us"}
    },
    "llama3-2-90b-instruct": {
        "supported_regions": {"us-east-1": "us", "us-east-2": "us", "us-west-2": "us"}
    },
}

client = get_bedrock_runtime_client()


class BedrockThrottlingException(Exception): ...


def _is_conversation_role(role: str) -> TypeGuard[ConversationRoleType]:
    return role in ["user", "assistant"]


def is_nova_model(model: type_model_name) -> bool:
    """Check if the model is an Amazon Nova model"""
    return "amazon-nova" in model


def is_deepseek_model(model: type_model_name) -> bool:
    """Check if the model is a DeepSeek model"""
    return "deepseek" in model


def is_llama_model(model: type_model_name) -> bool:
    """Check if the model is a Meta Llama model"""
    return "llama" in model


def is_mistral(model: type_model_name) -> bool:
    """Check if the model is a Mistral model"""
    return "mistral" in model


def is_gpt_oss_model(model: type_model_name) -> bool:
    """Check if the model is an OpenAI GPT-OSS model"""
    return "gpt-oss" in model


def is_qwen_model(model: type_model_name) -> bool:
    """Check if the model is a Qwen3 model"""
    return "qwen3" in model


def is_tooluse_supported(model: type_model_name) -> bool:
    """Check if the model is supported for tool use"""
    return model not in [
        "deepseek-r1",
        "llama3-2-1b-instruct",
        "llama3-2-3b-instruct",
        "",
    ]


def is_adaptive_thinking_model(model: type_model_name) -> bool:
    """Claude 4.6+ models use adaptive thinking instead of extended thinking with budget_tokens."""
    return model in [
        "claude-v4.6-opus",
        "claude-v4.6-sonnet",
        "claude-v4.7-opus",
    ]


def is_prefill_supported(model: type_model_name) -> bool:
    """Claude 4.6+ models do not support assistant message prefilling."""
    return model not in [
        "claude-v4.6-opus",
        "claude-v4.6-sonnet",
        "claude-v4.7-opus",
    ]


def is_specify_both_temperature_and_top_p_supported(model: type_model_name) -> bool:
    return model not in [
        "claude-v4.1-opus",
        "claude-v4.5-opus",
        "claude-v4.6-opus",
        "claude-v4.7-opus",
        "claude-v4.5-sonnet",
        "claude-v4.6-sonnet",
        "claude-v4.5-haiku",
    ]


def is_top_k_supported(model: type_model_name) -> bool:
    """Claude Opus 4.7+ deprecates top_k parameter."""
    return model not in [
        "claude-v4.7-opus",
    ]


def is_top_p_supported(model: type_model_name) -> bool:
    """Claude Opus 4.7+ deprecates top_p parameter."""
    return model not in [
        "claude-v4.7-opus",
    ]


def is_temperature_supported(model: type_model_name) -> bool:
    """Claude Opus 4.7+ deprecates temperature parameter."""
    return model not in [
        "claude-v4.7-opus",
    ]


def is_prompt_caching_supported(
    model: type_model_name, target: Literal["system", "message", "tool"]
) -> bool:
    if target == "tool":
        return model in [
            "claude-v4-opus",
            "claude-v4.1-opus",
            "claude-v4.5-opus",
            "claude-v4.6-opus",
            "claude-v4.7-opus",
            "claude-v4-sonnet",
            "claude-v4.5-sonnet",
            "claude-v4.6-sonnet",
            "claude-v4.5-haiku",
            "claude-v3.7-sonnet",
            "claude-v3.5-sonnet-v2",
            "claude-v3.5-haiku",
        ]

    else:
        return model in [
            "claude-v4-opus",
            "claude-v4.1-opus",
            "claude-v4.5-opus",
            "claude-v4.6-opus",
            "claude-v4.7-opus",
            "claude-v4-sonnet",
            "claude-v4.5-sonnet",
            "claude-v4.6-sonnet",
            "claude-v4.5-haiku",
            "claude-v3.7-sonnet",
            "claude-v3.5-sonnet-v2",
            "claude-v3.5-haiku",
            "amazon-nova-pro",
            "amazon-nova-lite",
            "amazon-nova-micro",
        ]


def is_multiple_system_prompt_content_supported(model: type_model_name):
    return not (
        is_nova_model(model)
        or is_deepseek_model(model)
        or is_llama_model(model)
        or is_mistral(model)
        or is_gpt_oss_model(model)
        or is_qwen_model(model)
    )


def is_unsigned_reasoning_content_supported(model: type_model_name):
    return not (is_deepseek_model(model) or is_gpt_oss_model(model))


class InferenceConfiguration(TypedDict):
    maxTokens: NotRequired[int]
    temperature: NotRequired[float]
    topP: NotRequired[float]
    stopSequences: NotRequired[list[str]]


class GuardrailConfiguration(TypedDict):
    guardrailIdentifier: str
    guardrailVersion: str
    trace: NotRequired[Literal["disabled", "enabled", "enabled_full"]]
    streamProcessingMode: NotRequired[Literal["async", "sync"]]


class ConverseConfiguration(TypedDict):
    inferenceConfig: InferenceConfiguration
    guardrailConfig: NotRequired[GuardrailConfiguration]
    additionalModelRequestFields: NotRequired[dict[str, Any]]


def _prepare_deepseek_model_params(
    model: type_model_name, generation_params: Optional[GenerationParamsModel] = None
) -> ConverseConfiguration:
    """
    Prepare inference configuration and additional model request fields for DeepSeek models
    > Note that DeepSeek models expect inference parameters as a JSON object under an inferenceConfig attribute,
    > similar to Amazon Nova models.
    """
    # Base inference configuration
    inference_config: InferenceConfiguration = {
        "maxTokens": (
            generation_params.max_tokens
            if generation_params
            else DEFAULT_DEEP_SEEK_GENERATION_CONFIG["max_tokens"]
        ),
        "temperature": (
            generation_params.temperature
            if generation_params
            else DEFAULT_DEEP_SEEK_GENERATION_CONFIG["temperature"]
        ),
        "topP": (
            generation_params.top_p
            if generation_params
            else DEFAULT_DEEP_SEEK_GENERATION_CONFIG["top_p"]
        ),
    }

    inference_config["stopSequences"] = (
        generation_params.stop_sequences
        if (
            generation_params
            and generation_params.stop_sequences
            and any(generation_params.stop_sequences)
        )
        else DEFAULT_DEEP_SEEK_GENERATION_CONFIG.get("stop_sequences", [])
    )

    return {
        "inferenceConfig": inference_config,
    }


def _prepare_mistral_model_params(
    model: type_model_name, generation_params: Optional[GenerationParamsModel] = None
) -> ConverseConfiguration:
    """
    Prepare inference configuration and additional model request fields for Mistral models
    > Note that Mistral models expect inference parameters as a JSON object under an inferenceConfig attribute,
    > similar to other models.
    """
    # Base inference configuration
    inference_config: InferenceConfiguration = {
        "maxTokens": (
            generation_params.max_tokens
            if generation_params
            else DEFAULT_MISTRAL_GENERATION_CONFIG["max_tokens"]
        ),
        "temperature": (
            generation_params.temperature
            if generation_params
            else DEFAULT_MISTRAL_GENERATION_CONFIG["temperature"]
        ),
        "topP": (
            generation_params.top_p
            if generation_params
            else DEFAULT_MISTRAL_GENERATION_CONFIG["top_p"]
        ),
    }

    inference_config["stopSequences"] = (
        generation_params.stop_sequences
        if (
            generation_params
            and generation_params.stop_sequences
            and any(generation_params.stop_sequences)
        )
        else DEFAULT_MISTRAL_GENERATION_CONFIG.get("stop_sequences", [])
    )

    converse_config: ConverseConfiguration = {
        "inferenceConfig": inference_config,
    }

    # Add top_k if specified in generation params
    if generation_params and generation_params.top_k is not None:
        converse_config["additionalModelRequestFields"] = {
            "topK": generation_params.top_k
        }

    return converse_config


def _prepare_gpt_oss_model_params(
    model: type_model_name, generation_params: Optional[GenerationParamsModel] = None
) -> ConverseConfiguration:
    """
    Prepare inference configuration for OpenAI GPT-OSS models
    Note: GPT-OSS models don't support stopSequences
    """
    # Base inference configuration
    inference_config: InferenceConfiguration = {
        "maxTokens": (
            generation_params.max_tokens
            if generation_params
            else DEFAULT_GENERATION_CONFIG["max_tokens"]
        ),
        "temperature": (
            generation_params.temperature
            if generation_params
            else DEFAULT_GENERATION_CONFIG["temperature"]
        ),
        "topP": (
            generation_params.top_p
            if generation_params
            else DEFAULT_GENERATION_CONFIG["top_p"]
        ),
    }

    # Note: GPT-OSS models don't support stopSequences, so we don't add it

    # No additional fields for GPT-OSS models

    return {
        "inferenceConfig": inference_config,
    }


def _prepare_qwen_model_params(
    model: type_model_name, generation_params: Optional[GenerationParamsModel] = None
) -> ConverseConfiguration:
    """
    Prepare inference configuration for Qwen3 models
    Qwen3 uses standard inferenceConfig (temperature, topP, maxTokens, stopSequences)
    """
    inference_config: InferenceConfiguration = {
        "maxTokens": (
            generation_params.max_tokens
            if generation_params
            else DEFAULT_QWEN_GENERATION_CONFIG["max_tokens"]
        ),
        "temperature": (
            generation_params.temperature
            if generation_params
            else DEFAULT_QWEN_GENERATION_CONFIG["temperature"]
        ),
        "topP": (
            generation_params.top_p
            if generation_params
            else DEFAULT_QWEN_GENERATION_CONFIG["top_p"]
        ),
    }

    inference_config["stopSequences"] = (
        generation_params.stop_sequences
        if (
            generation_params
            and generation_params.stop_sequences
            and any(generation_params.stop_sequences)
        )
        else DEFAULT_QWEN_GENERATION_CONFIG.get("stop_sequences", [])
    )

    return {
        "inferenceConfig": inference_config,
    }


def _prepare_llama_model_params(
    model: type_model_name, generation_params: Optional[GenerationParamsModel] = None
) -> ConverseConfiguration:
    """
    Prepare inference configuration and additional model request fields for Meta Llama models
    > Note that Llama models expect inference parameters as a JSON object under an inferenceConfig attribute,
    > similar to Amazon Nova models.
    """
    # Base inference configuration
    inference_config: InferenceConfiguration = {
        "maxTokens": (
            generation_params.max_tokens
            if generation_params
            else DEFAULT_LLAMA_GENERATION_CONFIG["max_tokens"]
        ),
        "temperature": (
            generation_params.temperature
            if generation_params
            else DEFAULT_LLAMA_GENERATION_CONFIG["temperature"]
        ),
        "topP": (
            generation_params.top_p
            if generation_params
            else DEFAULT_LLAMA_GENERATION_CONFIG["top_p"]
        ),
    }

    inference_config["stopSequences"] = (
        generation_params.stop_sequences
        if (
            generation_params
            and generation_params.stop_sequences
            and any(generation_params.stop_sequences)
        )
        else DEFAULT_LLAMA_GENERATION_CONFIG.get("stop_sequences", [])
    )

    # No additional fields for Llama models

    return {
        "inferenceConfig": inference_config,
    }


def _prepare_nova_model_params(
    model: type_model_name, generation_params: Optional[GenerationParamsModel] = None
) -> ConverseConfiguration:
    """
    Prepare inference configuration and additional model request fields for Nova models
    > Note that Amazon Nova expects inference parameters as a JSON object under a inferenceConfig attribute. Amazon Nova also has an additional parameter "topK" that can be passed as an additional inference parameters. This parameter follows the same structure and is passed through the additionalModelRequestFields, as shown below.
    https://docs.aws.amazon.com/nova/latest/userguide/getting-started-converse.html
    """
    # Base inference configuration
    inference_config: InferenceConfiguration = {
        "maxTokens": (
            generation_params.max_tokens
            if generation_params
            else DEFAULT_GENERATION_CONFIG["max_tokens"]
        ),
        "temperature": (
            generation_params.temperature
            if generation_params
            else DEFAULT_GENERATION_CONFIG["temperature"]
        ),
        "topP": (
            generation_params.top_p
            if generation_params
            else DEFAULT_GENERATION_CONFIG["top_p"]
        ),
    }

    converse_config: ConverseConfiguration = {
        "inferenceConfig": inference_config,
    }

    # Additional model request fields specific to Nova models
    # Add top_k if specified in generation params
    if generation_params and generation_params.top_k is not None:
        top_k = generation_params.top_k
        if top_k > 128:
            logger.warning(
                "In Amazon Nova, an 'unexpected error' occurs if topK exceeds 128. To avoid errors, the upper limit of A is set to 128."
            )
            top_k = 128

        converse_config["additionalModelRequestFields"] = {
            "inferenceConfig": {
                "topK": top_k,
            },
        }

    return converse_config


def _to_guardrails_grounding_source(
    search_results: list[SearchResult],
) -> GuardrailConverseContentBlockTypeDef | None:
    """Convert search results to Guardrails Grounding source format."""
    return (
        {
            "text": {
                "text": "\n\n".join(x["content"] for x in search_results),
                "qualifiers": ["grounding_source"],
            }
        }
        if len(search_results) > 0
        else None
    )


def simple_message_models_to_bedrock_messages(
    simple_messages: list[SimpleMessageModel],
    model: type_model_name,
    guardrail: BedrockGuardrailsModel | None = None,
    search_results: list[SearchResult] | None = None,
    prompt_caching_enabled: bool = True,
) -> list[MessageTypeDef]:
    grounding_source = None
    if search_results and guardrail and guardrail.is_guardrail_enabled:
        grounding_source = _to_guardrails_grounding_source(search_results)

    def process_content(c: ContentModel, role: str) -> list[ContentBlockTypeDef]:
        # Drop unsigned reasoning blocks for DeepSeek R1 and GPT-OSS models
        if (
            not is_unsigned_reasoning_content_supported(model)
            and c.content_type == "reasoning"
            and not getattr(c, "signature", None)
        ):
            return []

        if c.content_type == "text":
            if (
                role == "user"
                and guardrail
                and guardrail.grounding_threshold > 0
                and grounding_source
            ):
                return [
                    {"guardContent": grounding_source},
                    {
                        "guardContent": {
                            "text": {"text": c.body, "qualifiers": ["query"]}
                        }
                    },
                ]

        return c.to_contents_for_converse()

    messages: list[MessageTypeDef] = [
        {
            "role": message.role,
            "content": [
                block
                for c in message.content
                for block in process_content(c, message.role)
            ],
        }
        for message in simple_messages
        if _is_conversation_role(message.role)
    ]

    if prompt_caching_enabled and is_prompt_caching_supported(model, target="message"):
        for order, message in enumerate(
            filter(lambda m: m["role"] == "user", reversed(messages))
        ):
            if order >= 2:
                break

            message["content"] = [
                *(message["content"]),
                {
                    "cachePoint": {"type": "default"},
                },
            ]

    return messages


def generation_params_to_converse_configuration(
    model: type_model_name,
    generation_params: GenerationParamsModel | None = None,
    guardrail: BedrockGuardrailsModel | None = None,
    stream: bool = True,
    enable_reasoning: bool = False,
) -> ConverseConfiguration:
    converse_configuration: ConverseConfiguration

    if is_nova_model(model):
        # Special handling for Nova models
        converse_configuration = _prepare_nova_model_params(model, generation_params)

    elif is_deepseek_model(model):
        # Special handling for DeepSeek models
        converse_configuration = _prepare_deepseek_model_params(
            model, generation_params
        )

    elif is_llama_model(model):
        # Special handling for Llama models
        converse_configuration = _prepare_llama_model_params(model, generation_params)

    elif is_mistral(model):
        # Special handling for Mistral models
        converse_configuration = _prepare_mistral_model_params(model, generation_params)

    elif is_gpt_oss_model(model):
        # Special handling for GPT-OSS models
        converse_configuration = _prepare_gpt_oss_model_params(model, generation_params)

    elif is_qwen_model(model):
        # Special handling for Qwen3 models
        converse_configuration = _prepare_qwen_model_params(model, generation_params)

    else:
        # Standard handling for non-Nova models
        if enable_reasoning:
            max_tokens = (
                generation_params.max_tokens
                if generation_params
                else DEFAULT_GENERATION_CONFIG["max_tokens"]
            )

            if is_adaptive_thinking_model(model):
                # Claude 4.6 uses adaptive thinking instead of budget_tokens
                converse_configuration = {
                    "inferenceConfig": {
                        "maxTokens": max_tokens,
                        "stopSequences": (
                            generation_params.stop_sequences
                            if (
                                generation_params
                                and generation_params.stop_sequences
                                and any(generation_params.stop_sequences)
                            )
                            else DEFAULT_GENERATION_CONFIG.get("stop_sequences", [])
                        ),
                    },
                    "additionalModelRequestFields": {
                        "thinking": {
                            "type": "adaptive",
                        },
                    },
                }
                if is_temperature_supported(model):
                    converse_configuration["inferenceConfig"]["temperature"] = 1.0

                if is_top_p_supported(model):
                    converse_configuration["inferenceConfig"]["topP"] = (
                        generation_params.top_p
                        if generation_params
                        else DEFAULT_GENERATION_CONFIG["top_p"]
                    )

            else:
                budget_tokens = (
                    generation_params.reasoning_params.budget_tokens
                    if generation_params and generation_params.reasoning_params
                    else DEFAULT_GENERATION_CONFIG["reasoning_params"]["budget_tokens"]  # type: ignore
                )

                if max_tokens <= budget_tokens:
                    logger.warning(
                        f"max_tokens ({max_tokens}) must be greater than budget_tokens ({budget_tokens}). "
                        f"Setting max_tokens to {budget_tokens + 1024}"
                    )
                    max_tokens = budget_tokens + 1024

                converse_configuration = {
                    "inferenceConfig": {
                        "maxTokens": max_tokens,
                        "stopSequences": (
                            generation_params.stop_sequences
                            if (
                                generation_params
                                and generation_params.stop_sequences
                                and any(generation_params.stop_sequences)
                            )
                            else DEFAULT_GENERATION_CONFIG.get("stop_sequences", [])
                        ),
                    },
                    "additionalModelRequestFields": {
                        # top_k cannot be used with reasoning
                        "thinking": {
                            "type": "enabled",
                            "budget_tokens": budget_tokens,
                        },
                    },
                }
                if is_temperature_supported(model):
                    converse_configuration["inferenceConfig"]["temperature"] = 1.0

                if is_top_p_supported(model):
                    converse_configuration["inferenceConfig"]["topP"] = (
                        generation_params.top_p
                        if generation_params
                        else DEFAULT_GENERATION_CONFIG["top_p"]
                    )

        else:
            converse_configuration = {
                "inferenceConfig": {
                    "maxTokens": (
                        generation_params.max_tokens
                        if generation_params
                        else DEFAULT_GENERATION_CONFIG["max_tokens"]
                    ),
                    "stopSequences": (
                        generation_params.stop_sequences
                        if (
                            generation_params
                            and generation_params.stop_sequences
                            and any(generation_params.stop_sequences)
                        )
                        else DEFAULT_GENERATION_CONFIG.get("stop_sequences", [])
                    ),
                },
                "additionalModelRequestFields": {},
            }

            if is_top_k_supported(model):
                converse_configuration["additionalModelRequestFields"]["top_k"] = (
                    generation_params.top_k
                    if generation_params
                    else DEFAULT_GENERATION_CONFIG["top_k"]
                )

            if is_temperature_supported(model):
                converse_configuration["inferenceConfig"]["temperature"] = (
                    generation_params.temperature
                    if generation_params
                    else DEFAULT_GENERATION_CONFIG["temperature"]
                )

            if is_top_p_supported(model):
                converse_configuration["inferenceConfig"]["topP"] = (
                    generation_params.top_p
                    if generation_params
                    else DEFAULT_GENERATION_CONFIG["top_p"]
                )

    # "claude-v4.5-sonnet" cannot specify temperature and top_p together due to specifications.
    # https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-messages-request-response.html
    if not is_specify_both_temperature_and_top_p_supported(model):
        inference_config = converse_configuration["inferenceConfig"]
        if (
            inference_config.get("temperature")
            == DEFAULT_GENERATION_CONFIG["temperature"]
            and inference_config.get("topP") != DEFAULT_GENERATION_CONFIG["top_p"]
        ):
            del inference_config["temperature"]
        else:
            inference_config.pop("topP", None)

    if guardrail and guardrail.guardrail_arn and guardrail.guardrail_version:
        converse_configuration["guardrailConfig"] = {
            "guardrailIdentifier": guardrail.guardrail_arn,
            "guardrailVersion": guardrail.guardrail_version,
            "trace": "enabled",
        }

        if stream:
            # https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-streaming.html
            converse_configuration["guardrailConfig"]["streamProcessingMode"] = "async"

    return converse_configuration


@deprecated("Use strands instead")
def compose_args_for_converse_api(
    messages: list[SimpleMessageModel],
    model: type_model_name,
    instructions: list[str] = [],
    generation_params: GenerationParamsModel | None = None,
    guardrail: BedrockGuardrailsModel | None = None,
    search_results: list[SearchResult] | None = None,
    tools: dict[str, AgentTool] | None = None,
    stream: bool = True,
    enable_reasoning: bool = False,
    prompt_caching_enabled: bool = False,
) -> ConverseStreamRequestTypeDef:
    arg_messages = simple_message_models_to_bedrock_messages(
        simple_messages=messages,
        model=model,
        guardrail=guardrail,
        search_results=search_results,
        prompt_caching_enabled=prompt_caching_enabled,
    )
    tool_specs: list[ToolTypeDef] | None = (
        [
            {
                "toolSpec": tool.to_converse_spec(),
            }
            for tool in tools.values()
        ]
        if tools
        else None
    )

    # Prepare model-specific parameters
    converse_config = generation_params_to_converse_configuration(
        model=model,
        generation_params=generation_params,
        guardrail=guardrail,
        stream=stream,
        enable_reasoning=enable_reasoning,
    )

    system_prompts: list[SystemContentBlockTypeDef]

    if is_multiple_system_prompt_content_supported(model):
        system_prompts = [
            {
                "text": instruction,
            }
            for instruction in instructions
            if len(instruction) > 0
        ]

    else:
        system_prompts = (
            [
                {
                    "text": "\n\n".join(instructions),
                }
            ]
            if instructions and any(instructions)
            else []
        )

    if prompt_caching_enabled and not (
        tool_specs and not is_prompt_caching_supported(model, target="tool")
    ):
        if is_prompt_caching_supported(model, "system") and len(system_prompts) > 0:
            system_prompts.append(
                {
                    "cachePoint": {
                        "type": "default",
                    },
                }
            )

        if is_prompt_caching_supported(model, target="tool") and tool_specs:
            tool_specs.append(
                {
                    "cachePoint": {
                        "type": "default",
                    },
                }
            )

    # Construct the base arguments
    args: ConverseStreamRequestTypeDef = {
        "inferenceConfig": {},
        "modelId": get_model_id(model),
        "messages": arg_messages,
        "system": system_prompts,
    }

    inference_config = converse_config["inferenceConfig"]
    if "temperature" in inference_config:
        args["inferenceConfig"]["temperature"] = inference_config["temperature"]

    if "topP" in inference_config:
        args["inferenceConfig"]["topP"] = inference_config["topP"]

    if "maxTokens" in inference_config:
        args["inferenceConfig"]["maxTokens"] = inference_config["maxTokens"]

    if "stopSequences" in inference_config:
        args["inferenceConfig"]["stopSequences"] = inference_config["stopSequences"]

    if "additionalModelRequestFields" in converse_config:
        args["additionalModelRequestFields"] = converse_config[
            "additionalModelRequestFields"
        ]

    if "guardrailConfig" in converse_config:
        args["guardrailConfig"] = converse_config["guardrailConfig"]

    # NOTE: Some models doesn't support tool use. https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference-supported-models-features.html
    if tool_specs:
        args["toolConfig"] = {
            "tools": tool_specs,
        }

    return args


@retry(
    exceptions=(BedrockThrottlingException,),
    tries=3,
    delay=60,
    backoff=2,
    jitter=(0, 2),
    logger=logger,
)
@deprecated("Use strands instead")
def call_converse_api(
    args: ConverseStreamRequestTypeDef,
) -> ConverseResponseTypeDef:
    client = get_bedrock_runtime_client()
    try:
        return client.converse(**args)
    except ClientError as e:
        if e.response["Error"]["Code"] == "ThrottlingException":
            raise BedrockThrottlingException(
                "Bedrock API is throttling requests"
            ) from e
        raise


def calculate_price(
    model: type_model_name,
    input_tokens: int,
    output_tokens: int,
    cache_read_input_tokens: int,
    cache_write_input_tokens: int,
    region: str = BEDROCK_REGION,
) -> float:
    input_price = (
        BEDROCK_PRICING.get(region, {})
        .get(model, {})
        .get("input", BEDROCK_PRICING["default"][model]["input"])
    )
    output_price = (
        BEDROCK_PRICING.get(region, {})
        .get(model, {})
        .get("output", BEDROCK_PRICING["default"][model]["output"])
    )
    cache_read_input_price = (
        BEDROCK_PRICING.get(region, {})
        .get(model, {})
        .get(
            "cache_read_input",
            BEDROCK_PRICING["default"][model].get("cache_read_input", input_price),
        )
    )
    cache_write_input_price = (
        BEDROCK_PRICING.get(region, {})
        .get(model, {})
        .get(
            "cache_write_input",
            BEDROCK_PRICING["default"][model].get("cache_write_input", input_price),
        )
    )

    return (
        input_price * input_tokens / 1000.0
        + output_price * output_tokens / 1000.0
        + cache_read_input_price * cache_read_input_tokens / 1000.0
        + cache_write_input_price * cache_write_input_tokens / 1000.0
    )


def get_global_inference_profile_id(
    model: type_model_name, source_region: str
) -> str | None:
    """Get global inference profile ID if supported"""
    profile_info = GLOBAL_INFERENCE_PROFILES.get(model)
    if not profile_info or source_region not in profile_info["supported_regions"]:
        return None

    base_model_id = BASE_MODEL_IDS.get(model)
    return f"global.{base_model_id}" if base_model_id else None


def get_regional_inference_profile_id(
    model: type_model_name, source_region: str
) -> str | None:
    """Get regional cross-region inference profile ID if supported"""
    profile_info = REGIONAL_INFERENCE_PROFILES.get(model)
    if not profile_info or source_region not in profile_info["supported_regions"]:
        return None

    base_model_id = BASE_MODEL_IDS.get(model)
    if not base_model_id:
        return None

    area = profile_info["supported_regions"][source_region]
    return f"{area}.{base_model_id}"


def get_model_id(
    model: type_model_name,
    enable_global: bool = ENABLE_BEDROCK_GLOBAL_INFERENCE,
    enable_cross_region: bool = ENABLE_BEDROCK_CROSS_REGION_INFERENCE,
    bedrock_region: str = BEDROCK_REGION,
) -> str:
    base_model_id = BASE_MODEL_IDS.get(model)
    if not base_model_id:
        raise ValueError(f"Unsupported model: {model}")

    # 1. First, try to use global inference profile if enabled and available
    if enable_global:
        global_profile_id = get_global_inference_profile_id(model, bedrock_region)
        if global_profile_id:
            logger.info(
                f"Using global inference profile: {global_profile_id} for model '{model}'"
            )
            return global_profile_id

    # 2. Fallback to regional cross-region inference profile if enabled and available
    if enable_cross_region:
        regional_profile_id = get_regional_inference_profile_id(model, bedrock_region)
        if regional_profile_id:
            logger.info(
                f"Using regional cross-region model ID: {regional_profile_id} for model '{model}' in region '{bedrock_region}'"
            )
            return regional_profile_id
        else:
            logger.warning(
                f"Region '{bedrock_region}' does not support cross-region inference for model '{model}'."
            )

    # 3. Use standalone model (no global or cross-region inference)
    logger.info(f"Using local model ID: {base_model_id} for model '{model}'")
    return base_model_id
