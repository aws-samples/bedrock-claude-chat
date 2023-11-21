import os

import boto3

DDB_ENDPOINT_URL = os.environ.get("DDB_ENDPOINT_URL")
TABLE_NAME = os.environ.get("TABLE_NAME", "")
ACCOUNT = os.environ.get("ACCOUNT", "")
REGION = os.environ.get("REGION", "ap-northeast-1")
TABLE_ACCESS_ROLE_ARN = os.environ.get("TABLE_ACCESS_ROLE_ARN", "")


class RecordNotFoundError(Exception):
    pass


def _compose_conv_id(user_id: str, conversation_id: str):
    # Add user_id prefix for row level security to match with `LeadingKeys` condition
    return f"{user_id}#CONV#{conversation_id}"


def _decompose_conv_id(conv_id: str):
    return conv_id.split("#")[-1]


def _compose_bot_id(user_id: str, conversation_id: str):
    # Add user_id prefix for row level security to match with `LeadingKeys` condition
    return f"{user_id}#BOT#{conversation_id}"


def _decompose_bot_id(conv_id: str):
    return conv_id.split("#")[-1]


def _get_aws_resource(service_name, user_id=None):
    """
    Get AWS resource with optional row-level access control for DynamoDB.
    Ref: https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_examples_dynamodb_items.html
    """
    if "AWS_EXECUTION_ENV" not in os.environ:
        if DDB_ENDPOINT_URL:
            return boto3.resource(
                service_name,
                endpoint_url=DDB_ENDPOINT_URL,
                aws_access_key_id="key",
                aws_secret_access_key="key",
                region_name=REGION,
            )
        else:
            return boto3.resource(service_name)

    # Assuming role for specific user-level access
    if user_id:
        sts_client = boto3.client("sts")
        policy_document = {
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        # List of DynamoDB actions
                    ],
                    "Resource": [
                        # Resource ARNs
                    ],
                    "Condition": {
                        "ForAllValues:StringLike": {
                            "dynamodb:LeadingKeys": [f"{user_id}*"]
                        }
                    },
                }
            ]
        }
        assumed_role_object = sts_client.assume_role(
            RoleArn=TABLE_ACCESS_ROLE_ARN,
            RoleSessionName="DynamoDBSession",
            Policy=json.dumps(policy_document),
        )
        credentials = assumed_role_object["Credentials"]
        session = boto3.Session(
            aws_access_key_id=credentials["AccessKeyId"],
            aws_secret_access_key=credentials["SecretAccessKey"],
            aws_session_token=credentials["SessionToken"],
        )
        return session.resource(service_name, region_name=REGION)

    return boto3.resource(service_name)


def _get_dynamodb_client(user_id=None):
    """
    Get a DynamoDB client, optionally with row-level access control.
    """
    return _get_aws_resource("dynamodb", user_id=user_id).meta.client


def _get_table_client(user_id):
    """
    Get a DynamoDB table client with row-level access.
    """
    return _get_aws_resource("dynamodb", user_id=user_id).Table(TABLE_NAME)
