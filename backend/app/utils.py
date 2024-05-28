import json
import logging
import os
from datetime import datetime
from typing import Any, List, Literal

import boto3
import pg8000
from anthropic import AnthropicBedrock
from app.repositories.models.conversation import MessageModel
from aws_lambda_powertools.utilities import parameters
from botocore.client import Config
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

REGION = os.environ.get("REGION", "us-east-1")
BEDROCK_REGION = os.environ.get("BEDROCK_REGION", "us-east-1")
PUBLISH_API_CODEBUILD_PROJECT_NAME = os.environ.get(
    "PUBLISH_API_CODEBUILD_PROJECT_NAME", ""
)
DB_SECRETS_ARN = os.environ.get("DB_SECRETS_ARN", "")


def is_running_on_lambda():
    return "AWS_EXECUTION_ENV" in os.environ


def is_anthropic_model(model_id: str) -> bool:
    return model_id.startswith("anthropic") or False


def get_bedrock_client(region=BEDROCK_REGION):
    client = boto3.client("bedrock-runtime", region)
    return client


def get_anthropic_client(region=BEDROCK_REGION):
    client = AnthropicBedrock(aws_region=region)
    return client


def get_current_time():
    # Get current time as milliseconds epoch time
    return int(datetime.now().timestamp() * 1000)


def generate_presigned_url(
    bucket: str,
    key: str,
    content_type: str | None = None,
    expiration=3600,
    client_method: Literal["put_object", "get_object"] = "put_object",
):
    # See: https://github.com/boto/boto3/issues/421#issuecomment-1849066655
    client = boto3.client(
        "s3",
        region_name=REGION,
        config=Config(signature_version="v4", s3={"addressing_style": "path"}),
    )
    params = {"Bucket": bucket, "Key": key}
    if content_type:
        params["ContentType"] = content_type
    response = client.generate_presigned_url(
        ClientMethod=client_method,
        Params=params,
        ExpiresIn=expiration,
        HttpMethod="PUT" if client_method == "put_object" else "GET",
    )

    return response


def compose_upload_temp_s3_prefix(user_id: str, bot_id: str) -> str:
    return f"{user_id}/{bot_id}/_temp/"


def compose_upload_temp_s3_path(user_id: str, bot_id: str, filename: str) -> str:
    """Compose S3 path for temporary files.
    This path is used for uploading files to S3.
    """
    prefix = compose_upload_temp_s3_prefix
    return f"{prefix(user_id, bot_id)}{filename}"


def compose_upload_document_s3_path(user_id: str, bot_id: str, filename: str) -> str:
    """Compose S3 path for documents.
    The files on this path is used for embedding.
    """
    return f"{user_id}/{bot_id}/documents/{filename}"


def delete_file_from_s3(bucket: str, key: str):
    client = boto3.client("s3")

    # Check if the file exists
    try:
        client.head_object(Bucket=bucket, Key=key)
    except ClientError as e:
        if e.response["Error"]["Code"] == "404":
            raise FileNotFoundError(f"The file does not exist in bucket.")
        else:
            raise

    response = client.delete_object(Bucket=bucket, Key=key)
    return response


def delete_files_with_prefix_from_s3(bucket: str, prefix: str):
    """Delete all objects with the given prefix from the given bucket."""
    client = boto3.client("s3")
    response = client.list_objects_v2(Bucket=bucket, Prefix=prefix)

    if "Contents" not in response:
        return

    for obj in response["Contents"]:
        client.delete_object(Bucket=bucket, Key=obj["Key"])


def check_if_file_exists_in_s3(bucket: str, key: str):
    client = boto3.client("s3")

    # Check if the file exists
    try:
        client.head_object(Bucket=bucket, Key=key)
    except ClientError as e:
        if e.response["Error"]["Code"] == "404":
            return False
        else:
            raise

    return True


def move_file_in_s3(bucket: str, key: str, new_key: str):
    client = boto3.client("s3")

    # Check if the file exists
    try:
        client.head_object(Bucket=bucket, Key=key)
    except ClientError as e:
        if e.response["Error"]["Code"] == "404":
            raise FileNotFoundError(f"The file does not exist in bucket.")
        else:
            raise

    response = client.copy_object(
        Bucket=bucket, Key=new_key, CopySource={"Bucket": bucket, "Key": key}
    )
    response = client.delete_object(Bucket=bucket, Key=key)
    return response


def start_codebuild_project(environment_variables: dict) -> str:
    environment_variables_override = [
        {"name": key, "value": value} for key, value in environment_variables.items()
    ]
    client = boto3.client("codebuild")
    response = client.start_build(
        projectName=PUBLISH_API_CODEBUILD_PROJECT_NAME,
        environmentVariablesOverride=environment_variables_override,
    )
    return response["build"]["id"]


def query_postgres(
    query: str,
    params: tuple | None = None,
    include_columns: bool = False,
) -> tuple:
    """Query the PostgreSQL and return the results.
    Args:
        query (str): The SQL query to execute.
        params (tuple, optional): The parameters for the query template. Defaults to None.
        include_columns (bool, optional): Whether to include the column names in the result. Defaults to False.

    Returns:
        tuple: The results of the query.
        example: ((1, 'Alice'), (2, 'Bob')) if include_columns is False
                 (('id', 'name'), (1, 'Alice'), (2, 'Bob')) if include_columns is True
    """
    secrets: Any = parameters.get_secret(DB_SECRETS_ARN)  # type: ignore
    db_info = json.loads(secrets)

    conn = pg8000.connect(
        database=db_info["dbname"],
        host=db_info["host"],
        port=db_info["port"],
        user=db_info["username"],
        password=db_info["password"],
    )

    args = params if params else ()
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, args=args)
            res = cursor.fetchall()
            columns = tuple([desc[0] for desc in cursor.description])
    except Exception as e:
        logger.error(f"Error executing query: {e}")
        raise e
    finally:
        conn.close()

    logger.debug(f"{len(res)} records found.")

    if include_columns:
        return columns, res
    return res
