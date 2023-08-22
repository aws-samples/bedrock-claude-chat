import os

import requests
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from schema import User

REGION = os.environ.get("REGION", "ap-northeast-1")
USER_POOL_ID = os.environ.get("USER_POOL_ID", "")
CLIENT_ID = os.environ.get("CLIENT_ID", "")

security = HTTPBearer()


def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)):
    try:
        # Verify JWT token
        url = f"https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}/.well-known/jwks.json"
        response = requests.get(url)
        keys = response.json()["keys"]
        header = jwt.get_unverified_header(token.credentials)
        key = [k for k in keys if k["kid"] == header["kid"]][0]
        decoded = jwt.decode(
            token.credentials, key, algorithms=["RS256"], audience=CLIENT_ID
        )
        print(decoded)

        # Return user information
        return User(
            id=decoded["sub"],
            name=decoded["cognito:username"],
        )
    except (IndexError, JWTError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
