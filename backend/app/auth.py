import os

import jwt

REGION = os.environ.get("REGION", "ap-northeast-1")
USER_POOL_ID = os.environ.get("USER_POOL_ID", "")
CLIENT_ID = os.environ.get("CLIENT_ID", "")

ISSUER = f"https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}"
# PyJWKClient caches the fetched signing keys, so JWKS is not fetched on every request.
_jwks_client = jwt.PyJWKClient(f"{ISSUER}/.well-known/jwks.json", lifespan=3600)


def verify_token(token: str) -> dict:
    # Verify JWT token
    signing_key = _jwks_client.get_signing_key_from_jwt(token)
    decoded = jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256"],
        audience=CLIENT_ID,
        issuer=ISSUER,
    )
    # Only accept ID tokens. Cognito access tokens have token_use="access".
    if decoded.get("token_use") != "id":
        raise jwt.InvalidTokenError("Invalid token_use")
    return decoded
