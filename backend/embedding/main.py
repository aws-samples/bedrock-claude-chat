import argparse
import json
import logging
import os

import pg8000
import requests

from app.config import DEFAULT_EMBEDDING_CONFIG
from app.repositories.common import _get_table_client, RecordNotFoundError
from app.repositories.custom_bot import (
    compose_bot_id,
    decompose_bot_id,
    find_private_bot_by_id,
)

from app.routes.schemas.bot import type_sync_status
from app.utils import compose_upload_document_s3_path
from embedding.loaders import UrlLoader
from embedding.loaders.base import BaseLoader
from embedding.loaders.s3 import S3FileLoader
from embedding.wrapper import DocumentSplitter, Embedder
from llama_index.core.node_parser import SentenceSplitter
from ulid import ULID

logging.basicConfig(level=logging.INFO)

BEDROCK_REGION = os.environ.get("BEDROCK_REGION", "us-east-1")


DB_NAME = os.environ.get("DB_NAME", "postgres")
DB_HOST = os.environ.get("DB_HOST", "")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "password")
DB_PORT = int(os.environ.get("DB_PORT", 5432))
DOCUMENT_BUCKET = os.environ.get("DOCUMENT_BUCKET", "documents")

METADATA_URI = os.environ.get("ECS_CONTAINER_METADATA_URI_V4")


def get_exec_id() -> str:
    # Get task id from ECS metadata
    # Ref: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-metadata-endpoint-v4.html#task-metadata-endpoint-v4-enable
    response = requests.get(f"{METADATA_URI}/task")
    data = response.json()
    task_arn = data.get("TaskARN", "")
    task_id = task_arn.split("/")[-1]
    return task_id


def insert_to_postgres(
    bot_id: str, contents: list[str], sources: list[str], embeddings: list[list[float]]
):
    conn = pg8000.connect(
        database=DB_NAME,
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
    )

    try:
        with conn.cursor() as cursor:
            delete_query = "DELETE FROM items WHERE botid = %s"
            cursor.execute(delete_query, (bot_id,))

            insert_query = f"INSERT INTO items (id, botid, content, source, embedding) VALUES (%s, %s, %s, %s, %s)"
            values_to_insert = []
            for i, (source, content, embedding) in enumerate(
                zip(sources, contents, embeddings)
            ):
                id_ = str(ULID())
                print(f"Preview of content {i}: {content[:200]}")
                values_to_insert.append(
                    (id_, bot_id, content, source, json.dumps(embedding))
                )
            cursor.executemany(insert_query, values_to_insert)
        conn.commit()
        print(f"Successfully inserted {len(values_to_insert)} records.")
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def update_sync_status(
    user_id: str,
    bot_id: str,
    sync_status: type_sync_status,
    sync_status_reason: str,
    last_exec_id: str,
):
    table = _get_table_client(user_id)
    table.update_item(
        Key={"PK": user_id, "SK": compose_bot_id(user_id, bot_id)},
        UpdateExpression="SET SyncStatus = :sync_status, SyncStatusReason = :sync_status_reason, LastExecId = :last_exec_id",
        ExpressionAttributeValues={
            ":sync_status": sync_status,
            ":sync_status_reason": sync_status_reason,
            ":last_exec_id": last_exec_id,
        },
    )


def embed(
    loader: BaseLoader,
    contents: list[str],
    sources: list[str],
    embeddings: list[list[float]],
    chunk_size: int,
    chunk_overlap: int,
):
    splitter = DocumentSplitter(
        splitter=SentenceSplitter(
            paragraph_separator=r"\n\n\n",
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            # Use length of text as token count for cohere-multilingual-v3
            tokenizer=lambda text: [0] * len(text),
        )
    )
    embedder = Embedder(verbose=True)

    documents = loader.load()
    splitted = splitter.split_documents(documents)
    splitted_embeddings = embedder.embed_documents(splitted)

    contents.extend([t.page_content for t in splitted])
    sources.extend([t.metadata["source"] for t in splitted])
    embeddings.extend(splitted_embeddings)


def main(
    user_id: str,
    bot_id: str,
    sitemap_urls: list[str],
    source_urls: list[str],
    filenames: list[str],
    chunk_size: int,
    chunk_overlap: int,
):
    exec_id = ""
    try:
        exec_id = get_exec_id()
    except Exception as e:
        print(f"[ERROR] Failed to get exec_id: {e}")
        exec_id = "FAILED_TO_GET_ECS_EXEC_ID"

    update_sync_status(
        user_id,
        bot_id,
        "RUNNING",
        "",
        exec_id,
    )

    status_reason = ""
    try:
        if len(sitemap_urls) + len(source_urls) + len(filenames) == 0:
            status_reason = "No contents to embed."
            update_sync_status(
                user_id,
                bot_id,
                "SUCCEEDED",
                status_reason,
                exec_id,
            )
            return

        # Calculate embeddings using LangChain
        contents: list[str] = []
        sources: list[str] = []
        embeddings: list[list[float]] = []

        if len(source_urls) > 0:
            embed(
                UrlLoader(source_urls),
                contents,
                sources,
                embeddings,
                chunk_size,
                chunk_overlap,
            )
        if len(sitemap_urls) > 0:
            for sitemap_url in sitemap_urls:
                raise NotImplementedError()
        if len(filenames) > 0:
            for filename in filenames:
                embed(
                    S3FileLoader(
                        bucket=DOCUMENT_BUCKET,
                        key=compose_upload_document_s3_path(user_id, bot_id, filename),
                    ),
                    contents,
                    sources,
                    embeddings,
                    chunk_size,
                    chunk_overlap,
                )

        print(f"Number of chunks: {len(contents)}")

        # Insert records into postgres
        insert_to_postgres(bot_id, contents, sources, embeddings)
        status_reason = "Successfully inserted to vector store."
    except Exception as e:
        print("[ERROR] Failed to embed.")
        print(e)
        update_sync_status(
            user_id,
            bot_id,
            "FAILED",
            f"{e}",
            exec_id,
        )
        return

    update_sync_status(
        user_id,
        bot_id,
        "SUCCEEDED",
        status_reason,
        exec_id,
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("Keys", type=str)
    args = parser.parse_args()

    keys = json.loads(args.Keys)
    sk = keys["SK"]["S"]

    bot_id = decompose_bot_id(sk)

    pk = keys["PK"]["S"]
    user_id = pk

    new_image = find_private_bot_by_id(user_id, bot_id)

    embedding_params = new_image.embedding_params
    chunk_size = embedding_params.chunk_size
    chunk_overlap = embedding_params.chunk_overlap
    knowledge = new_image.knowledge
    sitemap_urls = knowledge.sitemap_urls
    source_urls = knowledge.source_urls
    filenames = knowledge.filenames

    print(f"source_urls to crawl: {source_urls}")
    print(f"sitemap_urls to crawl: {sitemap_urls}")
    print(f"filenames: {filenames}")
    print(f"chunk_size: {chunk_size}")
    print(f"chunk_overlap: {chunk_overlap}")

    main(
        user_id, bot_id, sitemap_urls, source_urls, filenames, chunk_size, chunk_overlap
    )
