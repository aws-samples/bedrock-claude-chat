from app.config import EMBEDDING_CONFIG


get_chunk_size = lambda bot_input: (
    bot_input.embedding_params.chunk_size
    if bot_input.embedding_params
    else EMBEDDING_CONFIG["chunk_size"]
)

get_chunk_overlap = lambda bot_input: (
    bot_input.embedding_params.chunk_overlap
    if bot_input.embedding_params
    else EMBEDDING_CONFIG["chunk_overlap"]
)
