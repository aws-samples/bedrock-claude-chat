import boto3
from app.repositories.common import RecordNotFoundError
from app.repositories.models.apigateway import (
    ApiKeyModel,
    ApiUsagePlanModel,
    ApiUsagePlanQuotaModel,
    ApiUsagePlanThrottleModel,
)
from ulid import ULID

client = boto3.client("apigateway")


def find_usage_plan_by_id(usage_plan_id: str) -> ApiUsagePlanModel:
    try:
        plan_response = client.get_usage_plan(usagePlanId=usage_plan_id)
    except client.exceptions.NotFoundException:
        raise RecordNotFoundError("The usage plan does not exist.")

    key_response = client.get_usage_plan_keys(usagePlanId=usage_plan_id, limit=100)

    return ApiUsagePlanModel(
        id=plan_response["id"],
        name=plan_response["name"],
        quota=ApiUsagePlanQuotaModel(
            limit=plan_response["quota"]["limit"],
            offset=plan_response["quota"]["offset"],
            period=plan_response["quota"]["period"],
        ),
        throttle=ApiUsagePlanThrottleModel(
            rate_limit=plan_response["throttle"]["rateLimit"],
            burst_limit=plan_response["throttle"]["burstLimit"],
        ),
        key_ids=[key["id"] for key in key_response["items"]],
    )


def find_api_key_by_id(key_id: str, include_value: bool = False) -> ApiKeyModel:
    response = client.get_api_key(apiKey=key_id, includeValue=include_value)
    return ApiKeyModel(
        id=response["id"],
        description=response["description"],
        value=response["value"] if include_value else "",
        enabled=response["enabled"],
        created_date=response["createdDate"].timestamp() * 1000,
    )


def create_api_key(usage_plan_id: str, description: str) -> ApiKeyModel:
    response = client.create_api_key(
        name=str(ULID()),
        description=description,
        enabled=True,
    )
    api_key_id = response["id"]
    client.create_usage_plan_key(
        usagePlanId=usage_plan_id, keyId=api_key_id, keyType="API_KEY"
    )

    return ApiKeyModel(
        id=api_key_id,
        value="",
        description=description,
        enabled=True,
        created_date=response["createdDate"].timestamp() * 1000,
    )


def delete_api_key(api_key_id: str):
    response = client.delete_api_key(apiKey=api_key_id)
    return response
