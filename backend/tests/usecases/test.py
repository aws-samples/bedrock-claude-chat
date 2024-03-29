import os
import json
import boto3

DDB_ENDPOINT_URL = os.environ.get("DDB_ENDPOINT_URL", "localhost:8080")
# DDB_ENDPOINT_URL = "http://localhost:8080"
TABLE_NAME = os.environ.get("TABLE_NAME", "")
ACCOUNT = os.environ.get("ACCOUNT", "")
REGION = os.environ.get("REGION", "ddblocal")
TABLE_ACCESS_ROLE_ARN = os.environ.get("TABLE_ACCESS_ROLE_ARN", "")
TRANSACTION_BATCH_SIZE = 25

print(f"REGION: {REGION}")
print(f"TABLE_NAME: {TABLE_NAME}")
print(f"DDB_DDB_ENDPOINT_URL: {DDB_ENDPOINT_URL}")


def _get_aws_resource(service_name, user_id=None):
    """Get AWS resource with optional row-level access control for DynamoDB.
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

    policy_document = {
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "dynamodb:BatchGetItem",
                    "dynamodb:BatchWriteItem",
                    "dynamodb:ConditionCheckItem",
                    "dynamodb:DeleteItem",
                    "dynamodb:DescribeTable",
                    "dynamodb:GetItem",
                    "dynamodb:GetRecords",
                    "dynamodb:PutItem",
                    "dynamodb:Query",
                    "dynamodb:Scan",
                    "dynamodb:UpdateItem",
                ],
                "Resource": [
                    f"arn:aws:dynamodb:{REGION}:{ACCOUNT}:table/{TABLE_NAME}",
                    f"arn:aws:dynamodb:{REGION}:{ACCOUNT}:table/{TABLE_NAME}/index/*",
                ],
            }
        ]
    }
    if user_id:
        policy_document["Statement"][0]["Condition"] = {
            # Allow access to items with the same partition key as the user id
            "ForAllValues:StringLike": {"dynamodb:LeadingKeys": [f"{user_id}*"]}
        }

    sts_client = boto3.client("sts")
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


client = _get_aws_resource("dynamodb").Table(TABLE_NAME)
print(client.table_status)
