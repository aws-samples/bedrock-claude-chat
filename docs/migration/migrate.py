import json

import boto3

TABLE_NAME = "BedrockChatStack-DatabaseConversationTableXXXXX"
CLUSTER_NAME = "BedrockChatStack-EmbeddingClusterXXXXX"
TASK_DEFINITION_NAME = "BedrockChatStackEmbeddingTaskDefinitionXXXXX"
CONTAINER_NAME = "Container"  # No need to change
SUBNETS = ["subnet-xxxxx"]
SECURITY_GROUPS = ["sg-xxxx"]  # BedrockChatStack-EmbeddingTaskSecurityGroupXXXXX

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)
ecs = boto3.client("ecs")

scan_kwargs = {
    "FilterExpression": "contains(SK, :substring)",
    "ExpressionAttributeValues": {":substring": "#BOT#"},
}

while True:
    response = table.scan(**scan_kwargs)

    print("Bots found in this scan:")
    for item in response["Items"]:
        print(f"  - {item['Title']} ({item['SK']})")

    has_more_scans = "LastEvaluatedKey" in response

    if has_more_scans:
        user_input = input(
            f"\nStart embed tasks for these bots? There are more scans pending. (y/N): "
        )
    else:
        user_input = input(
            f"\nStart embed tasks for these bots? This is the last scan. (y/N): "
        )

    if user_input.lower() != "y":
        print("Skipped embed tasks for all bots in this scan.")
    else:
        for item in response["Items"]:
            pk = item["PK"]
            sk = item["SK"]

            payload = {
                "Keys": {
                    "PK": {"S": pk},
                    "SK": {"S": sk},
                },
            }

            response = ecs.run_task(
                cluster=CLUSTER_NAME,
                launchType="FARGATE",
                taskDefinition=TASK_DEFINITION_NAME,
                networkConfiguration={
                    "awsvpcConfiguration": {
                        "subnets": SUBNETS,
                        "securityGroups": SECURITY_GROUPS,
                        "assignPublicIp": "ENABLED",
                    }
                },
                overrides={
                    "containerOverrides": [
                        {
                            "name": CONTAINER_NAME,
                            "command": [
                                "-u",
                                "embedding/main.py",
                                json.dumps(payload["Keys"]),
                            ],
                        }
                    ]
                },
            )

            print(f"Started embed task for bot: {sk}")

    if not has_more_scans:
        print("All bots have been processed. No more scans needed.")
        break

    scan_kwargs["ExclusiveStartKey"] = response["LastEvaluatedKey"]
