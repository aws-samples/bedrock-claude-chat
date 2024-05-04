import json
import logging
import os
import re
from typing import Literal

import pg8000
from app.bedrock import calculate_query_embedding
from app.utils import generate_presigned_url
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


def filter_used_results(
    generated_text: str, search_results: list[SearchResult]
) -> list[SearchResult]:
    """Filter the search results based on the citations in the generated text.
    Note that the citations in the generated text are in the format of [^rank].
    """
    used_results: list[SearchResult] = []

    try:
        # Extract citations from the generated text
        citations = [
            citation.strip("[]^")
            for citation in re.findall(r"\[\^(\d+)\]", generated_text)
        ]
    except Exception as e:
        logger.error(f"Error extracting citations from the generated text: {e}")
        return used_results

    for result in search_results:
        if str(result.rank) in citations:
            used_results.append(result)

    return used_results


def get_source_link(source: str) -> tuple[Literal["s3", "url"], str]:
    if source.startswith("s3://"):
        s3_path = source[5:]  # Remove "s3://" prefix
        path_parts = s3_path.split("/", 1)
        bucket_name = path_parts[0]
        object_key = path_parts[1] if len(path_parts) > 1 else ""

        source_link = generate_presigned_url(
            bucket=bucket_name,
            key=object_key,
            client_method="get_object",
        )
        return "s3", source_link
    elif source.startswith("http://") or source.startswith("https://"):
        return "url", source
    else:
        # Assume source is a youtube video id
        return "url", f"https://www.youtube.com/watch?v={source}"


def search_related_docs(bot_id: str, limit: int, query: str) -> list[SearchResult]:
    """Search to fetch top n most related documents from pgvector.
    Args:
        bot_id (str): bot id
        limit (int): number of results to return
        query (str): query string
    Returns:
        list[SearchResult]: list of search results
    """
    query_embedding = calculate_query_embedding(query)
    logger.info(f"query_embedding: {query_embedding}")

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
            # It's important to choose the same distance metric as the one used for indexing.
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

    logger.info(f"{len(results)} records found.")

    # NOTE: results should be:
    # [
    #     ('123', 'bot_1', 'content_1', 'source_1', [0.123, 0.456, 0.789]),
    #     ('124', 'bot_1', 'content_2', 'source_2', [0.234, 0.567, 0.890]),
    #     ...
    # ]
    return [
        SearchResult(rank=i, bot_id=r[1], content=r[2], source=r[3])
        for i, r in enumerate(results)
    ]
