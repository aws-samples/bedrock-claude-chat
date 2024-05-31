# Database Migration Guide

This guide outlines the steps to migrate data when performing an update of Bedrock Claude Chat which contains an Aurora cluster replacement. The following procedure ensures a smooth transition while minimizing downtime and data loss.

## Overview

The migration process involves scanning all bots and launching embedding ECS tasks for each of them. This approach requires re-calculation of embeddings, which can be time-consuming and incur additional costs due to ECS task execution and Bedrock Cohere usage fees. If you prefer to avoid these costs and time requirements, please refer to the [alternative migration options](#alternative-migration-options) provided later in this guide.

## Migration Steps

- After [cdk deploy](../README.md#deploy-using-cdk) with Aurora replacement, open the [migrate.py](./migrate.py) script and update the following variables with the appropriate values. The values can be referred on `CloudFormation` > `BedrockChatStack` > `Outputs` tab.

```py
# Open the CloudFormation stack in the AWS Management Console and copy the values from the Outputs tab.
# Key: DatabaseConversationTableNameXXXX
TABLE_NAME = "BedrockChatStack-DatabaseConversationTableXXXXX"
# Key: EmbeddingClusterNameXXX
CLUSTER_NAME = "BedrockChatStack-EmbeddingClusterXXXXX"
# Key: EmbeddingTaskDefinitionNameXXX
TASK_DEFINITION_NAME = "BedrockChatStackEmbeddingTaskDefinitionXXXXX"
CONTAINER_NAME = "Container"  # No need to change
# Key: PrivateSubnetId0
SUBNET_ID = "subnet-xxxxx"
# Key: EmbeddingTaskSecurityGroupIdXXX
SECURITY_GROUP_ID = "sg-xxxx"  # BedrockChatStack-EmbeddingTaskSecurityGroupXXXXX
```

- Run the `migrate.py` script to initiate the migration process. This script will scan all bots, launch embedding ECS tasks, and create the data to the new Aurora cluster. Note that:
  - The script requires `boto3`.
  - The environment requires IAM permissions to access the dynamodb table and to invoke ECS tasks.

## Alternative Migration Options

If you prefer not to use the above method due to the associated time and cost implications, consider the following alternative approaches:

### Snapshot Restore and DMS Migration

Firstly, note the password to access current Aurora cluster. Then run `cdk deploy`, which triggers replacement of the cluster. After that, create a temporary database by restoring from a snapshot of the original database.
Use [AWS Database Migration Service (DMS)](https://aws.amazon.com/dms/) to migrate data from the temporary database to the new Aurora cluster.

Note: As of May 29, 2024, DMS does not natively support the pgvector extension. However, you can explore the following options to work around this limitation:

Use [DMS homogeneous migration](https://docs.aws.amazon.com/dms/latest/userguide/dm-migrating-data.html), which leverages native logical replication. In this case, both the source and target databases must be PostgreSQL. DMS can leverage native logical replication for this purpose.

Consider the specific requirements and constraints of your project when choosing the most suitable migration approach.
