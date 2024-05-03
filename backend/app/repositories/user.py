import os
import boto3
from botocore.exceptions import ClientError

cognito_idp_client = None

class UserNotFoundException(Exception):
    pass

def find_user_by_username(username: str, user_pool_id: str):
    global cognito_idp_client
    if not cognito_idp_client:
        cognito_idp_client = boto3.client('cognito-idp')

    try:
        response = cognito_idp_client.admin_get_user(
            UserPoolId=user_pool_id,
            Username=username
        )
        user_attributes = response['UserAttributes']
        user_id = next((attr['Value'] for attr in user_attributes if attr['Name'] == 'sub'), None)
        if user_id:
            return user_id
        else:
            raise UserNotFoundException(f"User with username {username} not found.")
    except ClientError as e:
        if e.response['Error']['Code'] == 'UserNotFoundException':
            raise UserNotFoundException(f"User with username {username} not found.")
        else:
            raise e