import logging
import re

import boto3
from app.repositories.common import RecordNotFoundError
from app.repositories.model import PublishedApiStackModel

logger = logging.getLogger(__name__)


def find_stack_by_bot_id(bot_id: str) -> PublishedApiStackModel:
    client = boto3.client("cloudformation")
    stack_name = f"ApiPublishmentStack{bot_id}"

    try:
        response = client.describe_stacks(StackName=stack_name)
    except client.exceptions.ClientError as e:
        raise RecordNotFoundError()

    stack = response["Stacks"][0]
    return PublishedApiStackModel(
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


def delete_stack_by_bot_id(bot_id: str):
    client = boto3.client("cloudformation")
    stack_name = f"ApiPublishmentStack{bot_id}"
    response = client.delete_stack(StackName=stack_name)
    return response
