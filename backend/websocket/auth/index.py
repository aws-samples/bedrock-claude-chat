import os

import requests
from jose import JWTError, jwt

REGION = os.environ.get("REGION", "ap-northeast-1")
USER_POOL_ID = os.environ.get("USER_POOL_ID", "")
CLIENT_ID = os.environ.get("CLIENT_ID", "")


def deny_all_policy():
    return {
        "principalId": "*",
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": "*",
                    "Effect": "Deny",
                    "Resource": "*",
                }
            ],
        },
    }


def allow_policy(method_arn: str, decoded):
    return {
        "principalId": decoded["sub"],
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": "execute-api:Invoke",
                    "Effect": "Allow",
                    "Resource": method_arn,
                }
            ],
        },
        # Add token to context so that we can use it to invoke api
        "context": {"user_id": decoded["sub"]},
    }


def handler(event, context):
    print(event)
    try:
        token = event["queryStringParameters"]["token"]
        url = f"https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}/.well-known/jwks.json"
        response = requests.get(url)
        keys = response.json()["keys"]
        header = jwt.get_unverified_header(token)
        key = [k for k in keys if k["kid"] == header["kid"]][0]
        decoded = jwt.decode(token, key, algorithms=["RS256"], audience=CLIENT_ID)

        return allow_policy(event["methodArn"], decoded)
    except Exception as e:
        print(e)
        return deny_all_policy()
