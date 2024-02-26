import logging
import re

import boto3
from app.repositories.common import RecordNotFoundError
from app.repositories.model import PublishedApiStackModel

logger = logging.getLogger(__name__)


def find_all_published_api_stacks(
    limit: int | None = None,
) -> list[PublishedApiStackModel]:
    client = boto3.client("cloudformation")
    pattern = re.compile(r"ApiPublishmentStack\w+")

    stacks = []
    next_token = None

    query_count = 1
    MAX_QUERY_COUNT = 5
    while True:
        if next_token:
            response = client.describe_stacks(NextToken=next_token)
        else:
            response = client.describe_stacks()

        stacks.extend(
            PublishedApiStackModel(
                stack_id=stack["StackId"],
                stack_name=stack["StackName"],
                stack_status=stack["StackStatus"],
                api_id=[
                    output["OutputValue"]
                    for output in stack["Outputs"]
                    if output["OutputKey"] == "ApiId"
                ][0],
                api_name=[
                    output["OutputValue"]
                    for output in stack["Outputs"]
                    if output["OutputKey"] == "ApiName"
                ][0],
                api_usage_plan_id=[
                    output["OutputValue"]
                    for output in stack["Outputs"]
                    if output["OutputKey"] == "ApiUsagePlanId"
                ][0],
                api_allowed_origins=[
                    output["OutputValue"]
                    for output in stack["Outputs"]
                    if output["OutputKey"] == "AllowedOrigins"
                ][0].split(","),
                api_stage=[
                    output["OutputValue"]
                    for output in stack["Outputs"]
                    if output["OutputKey"] == "DeploymentStage"
                ][0],
                create_time=int(stack["CreationTime"].timestamp() * 1000),
            )
            for stack in response["Stacks"]
            if pattern.match(stack["StackName"])
        )

        if limit is not None and len(stacks) >= limit:
            stacks = stacks[:limit]
            break

        next_token = response.get("NextToken")
        if not next_token:
            break

        query_count += 1
        if query_count > MAX_QUERY_COUNT:
            logger.warning(f"Query count exceeded {MAX_QUERY_COUNT}")
            break

    return stacks


def find_stack_by_bot_id(bot_id: str) -> dict:
    client = boto3.client("cloudformation")
    stack_name = f"ApiPublishmentStack{bot_id}"

    try:
        response = client.describe_stacks(StackName=stack_name)
        if response["Stacks"]:
            return response["Stacks"][0]
    except client.exceptions.ClientError as e:
        raise RecordNotFoundError(f"Stack not found: {stack_name}") from e
