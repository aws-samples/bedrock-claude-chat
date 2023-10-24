import os

import requests
from jose import jwt

REGION = os.environ.get("REGION", "ap-northeast-1")
USER_POOL_ID = os.environ.get("USER_POOL_ID", "")
CLIENT_ID = os.environ.get("CLIENT_ID", "")


def verify_token(token: str) -> dict:
    # Verify JWT token
    url = f"https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}/.well-known/jwks.json"
    response = requests.get(url)
    keys = response.json()["keys"]
    header = jwt.get_unverified_header(token)
    key = [k for k in keys if k["kid"] == header["kid"]][0]
    decoded = jwt.decode(token, key, algorithms=["RS256"], audience=CLIENT_ID)
    return decoded
