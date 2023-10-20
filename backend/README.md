# Backend API

Written in Python with [FastAPI](https://fastapi.tiangolo.com/).

## Unit test on local

```
cd backend/common
python3 -m venv .venv
source .venv/bin/activate
pip install -r ../api/requirements.txt
```

```
export TABLE_NAME=BedrockChatStack-DatabaseConversationTablexxxx
export ACCOUNT=yyyy
export REGION=ap-northeast-1
export BEDROCK_REGION=us-east-1
```

```
python repositories/test_conversation.py TestConversationRepository
python test_bedrock.py
python test_usecase.py
```
