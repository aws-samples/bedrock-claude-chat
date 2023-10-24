import json
import os

import boto3
from botocore.exceptions import ClientError

TOPIC_ARN = os.environ["WEBSOCKET_TOPIC_ARN"]
sns_client = boto3.client("sns")


def handler(event, context):
    print(f"Received event: {event}")
    route_key = event["requestContext"]["routeKey"]

    if route_key == "$connect":
        # NOTE: Authentication is run at each message
        return {"statusCode": 200, "body": "Connected."}

    message = {
        "requestContext": event["requestContext"],
        "body": event["body"],
    }

    try:
        sns_response = sns_client.publish(
            TopicArn=TOPIC_ARN,
            Message=json.dumps(message),
        )

        response = {
            "statusCode": 200,
        }
    except ClientError as e:
        print(f"ClientError: {e}")
        response = {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
        }

    return response
