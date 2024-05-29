import json
import os
from typing import Any

import boto3
import pg8000
from app.repositories.apigateway import delete_api_key, find_usage_plan_by_id
from app.repositories.cloudformation import delete_stack_by_bot_id, find_stack_by_bot_id
from app.repositories.common import RecordNotFoundError, decompose_bot_id
from aws_lambda_powertools.utilities import parameters

DB_SECRETS_ARN = os.environ.get("DB_SECRETS_ARN", "")
DOCUMENT_BUCKET = os.environ.get("DOCUMENT_BUCKET", "documents")

s3_client = boto3.client("s3")


def delete_from_postgres(bot_id: str):
    """Delete data related to `bot_id` from vector store (i.e. PostgreSQL)."""

    secrets: Any = parameters.get_secret(DB_SECRETS_ARN)  # type: ignore
    db_info = json.loads(secrets)

    conn = pg8000.connect(
        database=db_info["dbname"],
        host=db_info["host"],
        port=db_info["port"],
        user=db_info["username"],
        password=db_info["password"],
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
    - cloudformation stack (if exists)
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

    # Check if cloudformation stack exists
    try:
        stack = find_stack_by_bot_id(bot_id)
    except RecordNotFoundError:
        print(f"Bot {bot_id} cloudformation stack not found. Skipping deletion.")
        return

    # Before delete cfn stack, delete all api keys
    usage_plan = find_usage_plan_by_id(stack.api_usage_plan_id)
    for key_id in usage_plan.key_ids:
        delete_api_key(key_id)

    # Delete `ApiPublishmentStack` by CloudFormation
    delete_stack_by_bot_id(bot_id)
