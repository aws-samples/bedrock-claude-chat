import os

import boto3
from app.repositories.common import RecordNotFoundError

PUBLISH_API_CODEBUILD_PROJECT_NAME = os.environ.get(
    "PUBLISH_API_CODEBUILD_PROJECT_NAME", ""
)

client = boto3.client("codebuild")


def find_build_status_by_build_id(build_id: str) -> str:
    response = client.batch_get_builds(ids=[build_id])
    if len(response["builds"]) == 0:
        raise RecordNotFoundError("Build not found.")
    return response["builds"][0]["buildStatus"]
