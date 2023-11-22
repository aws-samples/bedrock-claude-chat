# Backend API

Written in Python with [FastAPI](https://fastapi.tiangolo.com/).

- To get started, we need to deploy resources to create DynamoDB / Bedrock resource. To deploy, please see [Deploy using CDK](../README.md#deploy-using-cdk).
- Create virtual environment on your local machine

```
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r ./requirements.txt
```

- Configure environment variables

```
export TABLE_NAME=BedrockChatStack-DatabaseConversationTablexxxx
export ACCOUNT=yyyy
export REGION=ap-northeast-1
export BEDROCK_REGION=us-east-1
```

- Run unit test

```
python tests/test_bedrock.py
python tests/test_usecases.py
python tests/repositories/test_conversation.py TestConversationRepository
```
