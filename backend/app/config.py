from typing import TypedDict


class GenerationConfig(TypedDict):
    max_tokens: int
    top_k: int
    top_p: float
    temperature: float
    stop_sequences: list[str]


class EmbeddingConfig(TypedDict):
    model_id: str
    chunk_size: int
    chunk_overlap: int


# Configure generation parameter for Claude chat response.
# Adjust the values according to your application.
# See: https://docs.anthropic.com/claude/reference/complete_post
GENERATION_CONFIG: GenerationConfig = {
    "max_tokens": 2000,
    "top_k": 250,
    "top_p": 0.999,
    "temperature": 0.6,
    "stop_sequences": ["Human: ", "Assistant: "],
}

# Configure embedding parameter.
DEFAULT_EMBEDDING_CONFIG: EmbeddingConfig = {
    # DO NOT change `model_id` (currently other models are not supported)
    "model_id": "cohere.embed-multilingual-v3",
    # NOTE: consider that cohere allows up to 2048 tokens per request
    "chunk_size": 1000,
    "chunk_overlap": 200,
}

# Configure search parameter to fetch relevant documents from vector store.
SEARCH_CONFIG = {
    "max_results": 20,
}

# Used for price estimation.
# NOTE: The following is based on 2024-03-07
# See: https://aws.amazon.com/bedrock/pricing/
ANTHROPIC_PRICING = {
    "us-east-1": {
        "claude-instant-v1": {
            "input": 0.00080,
            "output": 0.00240,
        },
        "claude-v2": {
            "input": 0.00080,
            "output": 0.00240,
        },
        "claude-v3-haiku": {"input": 0.00025, "output": 0.00125},
        "claude-v3-sonnet": {"input": 0.00300, "output": 0.01500},
    },
    "us-west-2": {
        "claude-instant-v1": {
            "input": 0.00080,
            "output": 0.00240,
        },
        "claude-v2": {
            "input": 0.00080,
            "output": 0.00240,
        },
        "claude-v3-sonnet": {"input": 0.00300, "output": 0.01500},
    },
    "ap-northeast-1": {
        "claude-instant-v1": {
            "input": 0.00080,
            "output": 0.00240,
        },
        "claude-v2": {
            "input": 0.00080,
            "output": 0.00240,
        },
    },
    "default": {
        "claude-instant-v1": {
            "input": 0.00080,
            "output": 0.00240,
        },
        "claude-v2": {
            "input": 0.00080,
            "output": 0.00240,
        },
        "claude-v3-haiku": {"input": 0.00025, "output": 0.00125},
        "claude-v3-sonnet": {"input": 0.00300, "output": 0.01500},
    },
}
