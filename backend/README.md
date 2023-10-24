# Backend API

Written in Python with [FastAPI](https://fastapi.tiangolo.com/).

## Unit test on local

```
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r ./requirements.txt
```

```
export TABLE_NAME=BedrockChatStack-DatabaseConversationTablexxxx
export ACCOUNT=yyyy
export REGION=ap-northeast-1
export BEDROCK_REGION=us-east-1
```

```
python tests/test_conversation.py TestConversationRepository
python tests/test_bedrock.py
python tests/test_usecase.py
```
