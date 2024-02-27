import os
import re

from app.repositories.apigateway import find_usage_plan_by_id
from app.repositories.cloudformation import (
    find_all_published_api_stacks,
    find_stack_by_bot_id,
)
from app.repositories.cognito import find_cognito_user_by_user_id
from app.repositories.custom_bot import find_all_public_bots, find_public_bot_by_id
from app.route_schema import (
    PublishedApi,
    PublishedApiApiGateway,
    PublishedApiBot,
    PublishedApiBotKnowledge,
    PublishedApiMeta,
    PublishedApiQuota,
    PublishedApiThrottle,
    PublishedApiUser,
)
from app.utils import compose_upload_document_s3_path

REGION = os.environ["REGION"]
DOCUMENT_BUCKET = os.environ["DOCUMENT_BUCKET"]


def _compose_s3_file_link(user_id, bot_id, filename: str) -> str:
    s3_path = compose_upload_document_s3_path(user_id, bot_id, filename)
    return f"https://{REGION}.console.aws.amazon.com/s3/object/{DOCUMENT_BUCKET}?region={REGION}&bucketType=general&prefix={s3_path}"


def _compose_cfn_stack_link(stack_id: str) -> str:
    parts = stack_id.split(":")
    region = parts[3]
    link = f"https://{region}.console.aws.amazon.com/cloudformation/home?region={region}#/stacks/stackinfo?stackId={stack_id}"

    return link


def _compose_apigw_link(api_id: str) -> str:
    return f"https://{REGION}.console.aws.amazon.com/apigateway/main/apis/{api_id}/resources?api={api_id}&region={REGION}"


def _compose_apigw_endpoint(api_id: str, stage: str) -> str:
    return f"https://{api_id}.execute-api.{REGION}.amazonaws.com/{stage}"


def list_published_apis(limit: int | None = None) -> list[PublishedApi]:
    # TODO: concurrent fetch
    result = []
    # public_bots = find_all_public_bots(limit=limit)
    stacks = find_all_published_api_stacks(limit=limit)

    for stack in stacks:
        usage_plan = find_usage_plan_by_id(stack.api_usage_plan_id)
        # Extract bot_id from stack name
        bot_id = re.sub(r"ApiPublishmentStack", "", stack["StackName"])
        # Fetch bot detail
        bot = find_public_bot_by_id(bot_id)

        owner_user_id = "xxx"  # TODO: replace with real user
        # Fetch user detail from cognito
        cognito_user = find_cognito_user_by_user_id(owner_user_id)
        #

        result.append(
            PublishedApi(
                bot_id=bot_id,
                user=PublishedApiUser(
                    name=cognito_user.name,
                    email=cognito_user.email,
                    link=cognito_user.link,
                ),
                bot=PublishedApiBot(
                    title=bot.title,
                    description=bot.description,
                    instruction=bot.instruction,
                    knowledge=PublishedApiBotKnowledge(
                        source_urls=bot.knowledge.source_urls,
                        sitemap_urls=bot.knowledge.sitemap_urls,
                        file_s3_links=[
                            _compose_s3_file_link(owner_user_id, bot_id, filename)
                            for filename in bot.knowledge.filenames
                        ],
                    ),
                ),
                create_time=stack.create_time,
                deployment_status=stack.stack_status,
                cfn_stack_link=_compose_cfn_stack_link(stack.stack_id),
                api=PublishedApiApiGateway(
                    id=stack.api_id,
                    link=_compose_apigw_link(stack.api_id),
                    endpoint=_compose_apigw_endpoint(stack.api_id, stack.api_stage),
                    throttle=PublishedApiThrottle(
                        rate_limit=usage_plan.throttle.rate_limit,
                        burst_limit=usage_plan.throttle.burst_limit,
                    ),
                    quota=PublishedApiQuota(
                        limit=usage_plan.quota.limit,
                        offset=usage_plan.quota.offset,
                        period=usage_plan.quota.period,
                    ),
                    allowed_origins=stack.api_allowed_origins,
                ),
            )
        )

    return result
