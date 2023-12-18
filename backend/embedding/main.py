import argparse
import json
import os

import boto3
import pg8000
from app.config import EMBEDDING_CONFIG
from app.repositories.custom_bot import _decompose_bot_id
from langchain.document_loaders import UnstructuredURLLoader
from langchain.embeddings.bedrock import BedrockEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from ulid import ULID

BEDROCK_REGION = os.environ.get("BEDROCK_REGION", "us-east-1")
MODEL_ID = EMBEDDING_CONFIG["model_id"]
CHUNK_SIZE = EMBEDDING_CONFIG["chunk_size"]
CHUNK_OVERLAP = EMBEDDING_CONFIG["chunk_overlap"]

DB_NAME = os.environ.get("DB_NAME", "postgres")
DB_HOST = os.environ.get("DB_HOST", "")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "password")
DB_PORT = int(os.environ.get("DB_PORT", 5432))


def insert(
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
            for source, content, embedding in zip(sources, contents, embeddings):
                id_ = str(ULID())
                values_to_insert.append((id_, bot_id, content, source, embedding))

            cursor.executemany(insert_query, values_to_insert)

        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def main(bot_id: str, sitemap_urls: list[str], source_urls: list[str]):
    # TODO: sitemap

    # Calculate embeddings using LangChain
    loader = UnstructuredURLLoader(source_urls)
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP, length_function=len
    )
    embeddings_model = BedrockEmbeddings(
        client=boto3.client("bedrock-runtime", BEDROCK_REGION), model_id=MODEL_ID
    )

    documents = loader.load()
    splitted = text_splitter.split_documents(documents)

    contents = [t.page_content for t in documents]
    sources = [t.metadata["source"] for t in splitted]
    embeddings = embeddings_model.embed_documents([t.page_content for t in splitted])

    # Insert records into postgres
    try:
        insert(bot_id, contents, sources, embeddings)
        # Update bot status on dynamodb table
        # Need to care idenpotency
        # TODO
    except Exception as e:
        print(e)
        # Update bot status on dynamodb table
        # Need to care idenpotency
        # TODO

    return {"statusCode": 200, "body": "Success"}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("new_image", type=str)
    args = parser.parse_args()

    new_image = json.loads(args.new_image)
    print(new_image)

    knowledge = new_image["Knowledge"]["M"]
    print(knowledge)

    sitemap_urls = [x["S"] for x in knowledge["sitemap_urls"]["L"]]
    print(sitemap_urls)

    source_urls = [x["S"] for x in knowledge["source_urls"]["L"]]
    print(source_urls)

    sk = new_image["SK"]["S"]
    print(sk)

    bot_id = _decompose_bot_id(sk)

    main(bot_id, sitemap_urls, source_urls)
