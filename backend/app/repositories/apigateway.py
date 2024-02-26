import boto3
from app.repositories.common import RecordNotFoundError
from app.repositories.model import (
    ApiUsagePlanModel,
    ApiUsagePlanQuotaModel,
    ApiUsagePlanThrottleModel,
)

client = boto3.client("apigateway")


def find_apigateway_by_id(api_id: str):
    response = client.get_rest_api(restApiId=api_id)
    return response


def find_usage_plan_by_id(usage_plan_id: str) -> ApiUsagePlanModel:
    try:
        response = client.get_usage_plan(usagePlanId=usage_plan_id)
    except client.exceptions.NotFoundException:
        raise RecordNotFoundError("The usage plan does not exist.")
    return ApiUsagePlanModel(
        id=response["id"],
        name=response["name"],
        quota=ApiUsagePlanQuotaModel(
            limit=response["quota"]["limit"],
            offset=response["quota"]["offset"],
            period=response["quota"]["period"],
        ),
        throttle=ApiUsagePlanThrottleModel(
            rate_limit=response["throttle"]["rateLimit"],
            burst_limit=response["throttle"]["burstLimit"],
        ),
    )


def find_api_keys_by_usage_plan_id(usage_plan_id: str):
    response = client.get_usage_plan_keys(usagePlanId=usage_plan_id)
    return response
