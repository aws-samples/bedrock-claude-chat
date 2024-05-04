# Backend API

Written in Python with [FastAPI](https://fastapi.tiangolo.com/).

## Getting started

- To get started, we need to deploy resources to create DynamoDB / Bedrock resource. To deploy, please see [Deploy using CDK](../README.md#deploy-using-cdk).
- Create virtual environment on your local machine

```sh
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r ./requirements.txt
```

- Configure environment variables

```sh
export TABLE_NAME=BedrockChatStack-DatabaseConversationTablexxxx
export ACCOUNT=yyyy
export REGION=ap-northeast-1
export BEDROCK_REGION=us-east-1
export DOCUMENT_BUCKET=bedrockchatstack-documentbucketxxxxxxx
export LARGE_MESSAGE_BUCKET=bedrockchatstack-largemessagebucketxxx
export USER_POOL_ID=xxxxxxxxx
export CLIENT_ID=xxxxxxxxx
```

## Launch local server

```sh
uvicorn app.main:app  --reload --host 0.0.0.0 --port 8000
```

- To refer the specification, access to [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) for [Swagger](https://swagger.io/) and [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) for [Redoc](https://github.com/Redocly/redoc).

## Unit test

```sh
python tests/test_bedrock.py
python tests/test_repositories/test_conversation.py
python tests/test_repositories/test_custom_bot.py
python tests/test_usecases/test_bot.py
python tests/test_usecases/test_chat.py
```
