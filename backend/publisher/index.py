import datetime
import json
import logging
import os

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


TOPIC_ARN = os.environ["WEBSOCKET_TOPIC_ARN"]
WEBSOCKET_SESSION_TABLE_NAME = os.environ["WEBSOCKET_SESSION_TABLE_NAME"]
SNS_SIZE_LIMIT = 262144
APIGW_SIZE_LIMIT = 32 * 1024


sns_client = boto3.client("sns")
dynamodb_client = boto3.resource("dynamodb")
table = dynamodb_client.Table(WEBSOCKET_SESSION_TABLE_NAME)


def handler(event, context):
    print(f"Received event: {event}")
    route_key = event["requestContext"]["routeKey"]

    if route_key == "$connect":
        return {"statusCode": 200, "body": "Connected."}
    elif route_key == "$disconnect":
        return {"statusCode": 200, "body": "Disconnected."}

    connection_id = event["requestContext"]["connectionId"]
    domain_name = event["requestContext"]["domainName"]
    stage = event["requestContext"]["stage"]
    endpoint_url = f"https://{domain_name}/{stage}"
    gatewayapi = boto3.client("apigatewaymanagementapi", endpoint_url=endpoint_url)

    now = datetime.datetime.now()
    ttl = int(now.timestamp()) + (2 * 60 * 60)  # 2 hours from now
    body = event["body"]

    try:
        if body == "START":
            table.put_item(
                Item={"ConnectionId": connection_id, "Messages": [], "TTL": ttl}
            )
            return {"statusCode": 200, "body": "Session started."}
        elif body == "END":
            response = table.get_item(Key={"ConnectionId": connection_id})
            message_parts = response["Item"]["Messages"]
            # Sort by index
            sorted_parts = sorted(message_parts, key=lambda x: x["index"])
            full_message = "".join(part["part"] for part in sorted_parts)
            if len(full_message.encode("utf-8")) > SNS_SIZE_LIMIT:
                logger.error("Payload size exceeds SNS limit.")
                gatewayapi.post_to_connection(
                    ConnectionId=connection_id,
                    Data=json.dumps(
                        {"status": "ERROR", "reason": "Payload size exceeds SNS limit."}
                    ).encode("utf-8"),
                )
            else:
                sns_client.publish(
                    TopicArn=TOPIC_ARN,
                    Message=json.dumps(
                        {
                            "requestContext": event["requestContext"],
                            "body": full_message,
                        }
                    ),
                )
            table.delete_item(Key={"ConnectionId": connection_id})
            return {"statusCode": 200, "body": "Message sent."}
        else:
            try:
                message_json = json.loads(body)
                part_index = message_json["index"]
                message_part = message_json["part"]

                if len(message_part.encode("utf-8")) > APIGW_SIZE_LIMIT:
                    gatewayapi.post_to_connection(
                        ConnectionId=connection_id,
                        Data=json.dumps(
                            {
                                "status": "ERROR",
                                "reason": "Payload size exceeds APIGW limit.",
                            }
                        ).encode("utf-8"),
                    )
                    return {
                        "statusCode": 413,
                        "body": json.dumps({"error": "Payload too large."}),
                    }

                # Append the message part with its index
                table.update_item(
                    Key={"ConnectionId": connection_id},
                    UpdateExpression="SET Messages = list_append(Messages, :msg), #T = :ttl",
                    ExpressionAttributeNames={"#T": "TTL"},
                    ExpressionAttributeValues={
                        ":msg": [{"index": part_index, "part": message_part}],
                        ":ttl": ttl,
                    },
                    ConditionExpression="attribute_exists(Messages)",
                )
                return {"statusCode": 200, "body": "Message part received."}
            except ClientError as e:
                if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                    gatewayapi.post_to_connection(
                        ConnectionId=connection_id,
                        Data=json.dumps(
                            {
                                "status": "ERROR",
                                "reason": "Session not found. Did you send START?",
                            }
                        ).encode("utf-8"),
                    )
                    return {
                        "statusCode": 400,
                        "body": "Session not found. Did you send START?",
                    }
                else:
                    raise e
    except Exception as e:
        logger.error(f"Operation failed: {e}")
        gatewayapi.post_to_connection(
            ConnectionId=connection_id,
            Data=json.dumps({"status": "ERROR", "reason": str(e)}).encode("utf-8"),
        )
        return {"statusCode": 500, "body": str(e)}
