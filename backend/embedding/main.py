import json
import os

import boto3
import pg8000
from app.config import EMBEDDING_CONFIG
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
            insert_query = f"INSERT INTO items (id, botid, content, source, embedding) VALUES (%s, %s, %s, %s, %s)"
            values_to_insert = []
            for source, content, embedding in zip(sources, contents, embeddings):
                id_ = str(ULID())
                values_to_insert.append((id_, bot_id, content, source, embedding))

            cursor.executemany(insert_query, values_to_insert)
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def handler(event, context):
    print(event)

    # NOTE: Batch size is 1
    record = event["Records"][0]
    body = json.loads(record["body"])
    bot_id = body["bot_id"]
    urls = body["urls"]

    # Calculate embeddings using langchain
    loader = UnstructuredURLLoader(urls)
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
        # TODO
    except Exception as e:
        print(e)
        # Update bot status on dynamodb table
        # TODO

    return {"statusCode": 200, "body": "Success"}
