import json
import logging
import os

import pg8000
from app.bedrock import calculate_query_embedding
from app.utils import get_bedrock_client
from pydantic import BaseModel

logger = logging.getLogger(__name__)

DB_NAME = os.environ.get("DB_NAME", "postgres")
DB_HOST = os.environ.get("DB_HOST", "")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "password")
DB_PORT = int(os.environ.get("DB_PORT", 5432))


class SearchResult(BaseModel):
    bot_id: str
    content: str
    source: str
    rank: int


def search(bot_id: str, limit: int, query: str) -> list[SearchResult]:
    """Search to fetch top n most related documents from pgvector.
    Args:
        bot_id (str): bot id
        limit (int): number of results to return
        query (str): query string
    Returns:
        list[tuple]: list of tuples containing (id, botid, source, embedding)
        for each result. embedding is a list of floats.
    """
    query_embedding = calculate_query_embedding(query)
    logger.debug(f"query_embedding: {query_embedding}")

    conn = pg8000.connect(
        database=DB_NAME,
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
    )

    try:
        with conn.cursor() as cursor:
            # NOTE: <-> is the KNN by L2 distance in pgvector.
            # If you want to use inner product or cosine distance, use <#> or <=> respectively.
            # Ref: https://github.com/pgvector/pgvector?tab=readme-ov-file#getting-started
            search_query = """
SELECT id, botid, content, source, embedding 
FROM items 
WHERE botid = %s 
ORDER BY embedding <-> %s 
LIMIT %s
"""
            cursor.execute(search_query, (bot_id, json.dumps(query_embedding), limit))
            results = cursor.fetchall()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

    # NOTE: results should be:
    # [
    #     ('123', 'bot_1', 'content_1', 'source_1', [0.123, 0.456, 0.789]),
    #     ('124', 'bot_1', 'content_2', 'source_2', [0.234, 0.567, 0.890]),
    #     ...
    # ]
    logger.debug(f"search results: {results}")

    return [
        SearchResult(rank=i, bot_id=r[1], content=r[2], source=r[3])
        for i, r in enumerate(results)
    ]
