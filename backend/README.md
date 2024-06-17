# Backend API

Written in Python with [FastAPI](https://fastapi.tiangolo.com/).

## Getting started

- To get started, we need to deploy resources to create DynamoDB / Bedrock resource. To deploy, please see [Deploy using CDK](../README.md#deploy-using-cdk).
- Create [poetry](https://python-poetry.org/) environment on your local machine

```sh
cd backend
python3 -m venv .venv  # Optional (If you don't want to install poetry on your env)
source .venv/bin/activate  # Optional (If you don't want to install poetry on your env)
pip install poetry
poetry install
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
poetry run uvicorn app.main:app  --reload --host 0.0.0.0 --port 8000
```

- To refer the specification, access to [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) for [Swagger](https://swagger.io/) and [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) for [Redoc](https://github.com/Redocly/redoc).

## Unit test

```sh
poetry run python tests/test_bedrock.py
poetry run python tests/test_repositories/test_conversation.py
```
