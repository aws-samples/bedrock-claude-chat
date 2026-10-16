from app.auth import verify_token
from app.user import User
from fastapi import Depends, HTTPException, status
from fastapi.exceptions import RequestValidationError
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWTError

security = HTTPBearer()


def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)):
    try:
        decoded = verify_token(token.credentials)
        # Return user information
        return User(
            id=decoded["sub"],
            name=decoded["cognito:username"],
            email=decoded["email"],
            groups=decoded.get("cognito:groups", []),
        )
    except PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def check_admin(user: User = Depends(get_current_user)):
    if not user.is_admin():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can access this API.",
        )


def check_creating_bot_allowed(user: User = Depends(get_current_user)):
    if not user.is_creating_bot_allowed():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not allowed to create bot.",
        )


def check_publish_allowed(user: User = Depends(get_current_user)):
    if not user.is_publish_allowed():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not allowed to publish bot.",
        )
