import logging
import os
from typing import Literal

import boto3
from app.repositories.common import RecordNotFoundError
from app.route_schema import type_sync_status
from pydantic import BaseModel


class CognitoUserModel(BaseModel):
    name: str
    email: str
    link: str


logger = logging.getLogger(__name__)

USER_POOL_ID = os.environ.get("USER_POOL_ID")
REGION = os.environ.get("REGION")

client = boto3.client("cognito-idp", region_name="ap-northeast-1")


def find_cognito_user_by_user_id(user_id: str) -> CognitoUserModel:
    # TOOD: remove?
    try:
        response = client.admin_get_user(UserPoolId=USER_POOL_ID, Username=user_id)
        email = next(
            attribute["Value"]
            for attribute in response["UserAttributes"]
            if attribute["Name"] == "email"
        )

        console_link = f"https://{REGION}.console.aws.amazon.com/cognito/v2/idp/user-pools/{USER_POOL_ID}/users/details/{user_id}?region={REGION}"

        return CognitoUserModel(
            email=email,
            name=user_id,
            link=console_link,
        )
    except client.exceptions.UserNotFoundException:
        raise RecordNotFoundError(f"User not found: {user_id}")
    except Exception as e:
        raise e
