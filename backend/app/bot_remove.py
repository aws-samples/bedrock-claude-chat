import json
import os

import boto3
import pg8000
from app.repositories.common import decompose_bot_id

DB_HOST = os.environ.get("DB_HOST", "")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "password")
DB_PORT = int(os.environ.get("DB_PORT", 5432))
DB_NAME = os.environ.get("DB_NAME", "postgres")
DOCUMENT_BUCKET = os.environ.get("DOCUMENT_BUCKET", "documents")

s3_client = boto3.client("s3")


def delete_from_postgres(bot_id: str):
    """Delete data related to `bot_id` from vector store (i.e. PostgreSQL)."""
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
        conn.commit()
        print(f"Successfully deleted records for bot_id: {bot_id}")
    except Exception as e:
        conn.rollback()
        print(f"Error deleting records for bot_id: {bot_id}")
        print(e)
    finally:
        conn.close()


def delete_from_s3(user_id: str, bot_id: str):
    """Delete all files in S3 bucket for the specified `user_id` and `bot_id`."""
    prefix = f"{user_id}/{bot_id}/"
    try:
        # List all objects with the specific prefix
        objects_to_delete = s3_client.list_objects_v2(
            Bucket=DOCUMENT_BUCKET, Prefix=prefix
        )
        if "Contents" in objects_to_delete:
            # Prepare the list of objects to delete
            delete_keys = [{"Key": obj["Key"]} for obj in objects_to_delete["Contents"]]
            # Delete the objects
            s3_client.delete_objects(
                Bucket=DOCUMENT_BUCKET, Delete={"Objects": delete_keys}
            )
            print(f"Successfully deleted files from S3 for bot_id: {bot_id}")
        else:
            print("No files found to delete in S3.")
    except Exception as e:
        print(f"Error deleting files for bot_id: {bot_id}")
        print(e)


def handler(event, context):
    """Bot removal handler.
    This function is triggered by dynamodb stream when item is deleted.
    Following resources are deleted asynchronously when bot is deleted:
    - vector store record (postgres)
    - s3 files
    """

    print(f"Received event: {event}")

    # NOTE: batch size is 1
    record = event["Records"][0]

    pk = record["dynamodb"]["Keys"]["PK"]["S"]
    sk = record["dynamodb"]["Keys"].get("SK", {}).get("S")
    if not sk or "#BOT#" not in sk:
        # Ignore non-bot items
        print(f"Skipping event for SK: {sk}")
        return

    user_id = pk
    bot_id = decompose_bot_id(sk)

    delete_from_postgres(bot_id)
    delete_from_s3(user_id, bot_id)
