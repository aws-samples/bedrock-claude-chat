# Migration Guide (v0 to v1)

If you already use Bedrock Claude Chat with a previous version (~`0.4.x`), you need to follow the steps bellow to migrate.

## Why do I need to do it?

This major update includes important security updates.

- The vector database (i.e., pgvector on Aurora PostgreSQL) storage is now encrypted, which triggers a replacement when deployed. This means existing vector items will be deleted.
- We introduced `CreatingBotAllowed` Cognito user group to limit users who can create bots. Current existing users are not in this group, so you need to attach the permission manually if you want them to have bot creation capabilities. See: [Bot Personalization](../../README.md#bot-personalization)

## Prerequisites

Read [Database Migration Guide](./DATABASE_MIGRATION.md) and determine the method for restoring items.

## Steps

### Vector store migration

- Open your terminal and navigate to the project directory
- Pull the branch you wish to deploy. Following is to the desired branch (in this case, `v1`) and pull the latest changes:

```sh
git fetch
git checkout v1
git pull origin v1
```

- If you wish to restore items with DMS, DO NOT FORGET to disable password rotation and note the password to access the database. If restoring with the migration script([migrate.py](./migrate.py)), you don't need to note the password.
- Remove all [published APIs](../PUBLISH_API.md) so that CloudFormation can remove existing Aurora cluster.
- Run [cdk deploy](../README.md#deploy-using-cdk) triggers Aurora cluster replacement and DELETES ALL VECTOR ITEMS.
- Follow [Database Migration Guide](./DATABASE_MIGRATION.md) to restore vector items.
- Verify that user can utilize existing bots who have knowledge i.e. RAG bots.

### Attach CreatingBotAllowed permission

- After the deployment, all users will be unable to create new bots.
- If you want specific users to be able to create bots, add those users to the `CreatingBotAllowed` group using the management console or CLI.
- Verify whether the user can create a bot. Note that the users need to do re-login.
