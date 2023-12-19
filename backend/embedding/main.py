import argparse
import json
import os

import boto3
import nest_asyncio
import pg8000
from app.config import EMBEDDING_CONFIG
from app.repositories.common import _get_table_client
from app.repositories.custom_bot import _compose_bot_id, _decompose_bot_id
from app.route_schema import type_sync_status
from langchain.document_loaders import SitemapLoader, UnstructuredURLLoader
from langchain.embeddings.bedrock import BedrockEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders.base import BaseLoader
from ulid import ULID

nest_asyncio.apply()

BEDROCK_REGION = os.environ.get("BEDROCK_REGION", "us-east-1")
MODEL_ID = EMBEDDING_CONFIG["model_id"]
CHUNK_SIZE = EMBEDDING_CONFIG["chunk_size"]
CHUNK_OVERLAP = EMBEDDING_CONFIG["chunk_overlap"]

DB_NAME = os.environ.get("DB_NAME", "postgres")
DB_HOST = os.environ.get("DB_HOST", "")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "password")
DB_PORT = int(os.environ.get("DB_PORT", 5432))


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
    user_id: str, bot_id: str, sync_status: type_sync_status, sync_status_reason: str
):
    table = _get_table_client(user_id)
    table.update_item(
        Key={"PK": user_id, "SK": _compose_bot_id(user_id, bot_id)},
        UpdateExpression="SET SyncStatus = :sync_status, SyncStatusReason = :sync_status_reason",
        ExpressionAttributeValues={
            ":sync_status": sync_status,
            ":sync_status_reason": sync_status_reason,
        },
    )


def embed(
    loader: BaseLoader,
    contents: list[str],
    sources: list[str],
    embeddings: list[list[float]],
):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP, length_function=len
    )
    embeddings_model = BedrockEmbeddings(
        client=boto3.client("bedrock-runtime", BEDROCK_REGION), model_id=MODEL_ID
    )
    documents = loader.load()
    splitted = text_splitter.split_documents(documents)

    contents.extend([t.page_content for t in splitted])
    sources.extend([t.metadata["source"] for t in splitted])

    print("Embedding...")
    embeddings.extend(
        embeddings_model.embed_documents([t.page_content for t in splitted])
    )
    print("Done embedding.")


def main(user_id: str, bot_id: str, sitemap_urls: list[str], source_urls: list[str]):
    update_sync_status(
        user_id,
        bot_id,
        "RUNNING",
        "",
    )

    try:
        # Calculate embeddings using LangChain
        contents = []
        sources = []
        embeddings = []

        if len(source_urls) > 0:
            embed(UnstructuredURLLoader(source_urls), contents, sources, embeddings)
        if len(sitemap_urls) > 0:
            for sitemap_url in sitemap_urls:
                loader = SitemapLoader(web_path=sitemap_url)
                loader.requests_per_second = 1
                embed(loader, contents, sources, embeddings)

        print(f"Number of chunks: {len(contents)}")

        # Insert records into postgres
        insert_to_postgres(bot_id, contents, sources, embeddings)
    except Exception as e:
        print("[ERROR] Failed to embed.")
        print(e)
        update_sync_status(user_id, bot_id, "FAILED", f"{e}")
        return

    update_sync_status(
        user_id,
        bot_id,
        "SUCCEEDED",
        "",
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("new_image", type=str)
    args = parser.parse_args()

    # `dynamodb.NewImage` from EventBridge Pipes
    new_image = json.loads(args.new_image)

    knowledge = new_image["Knowledge"]["M"]
    sitemap_urls = [x["S"] for x in knowledge["sitemap_urls"]["L"]]
    source_urls = [x["S"] for x in knowledge["source_urls"]["L"]]

    sk = new_image["SK"]["S"]
    bot_id = _decompose_bot_id(sk)

    pk = new_image["PK"]["S"]
    user_id = pk

    print(f"source_urls to crawl: {source_urls}")
    print(f"sitemap_urls to crawl: {sitemap_urls}")

    assert len(source_urls) > 0 or len(sitemap_urls) > 0

    main(user_id, bot_id, sitemap_urls, source_urls)
