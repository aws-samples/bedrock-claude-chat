FROM python:3.11.4-slim-bullseye

RUN apt update && apt install -y curl unzip

WORKDIR /app
COPY . .

# Install lambda web adapter
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.7.0 /lambda-adapter /opt/extensions/lambda-adapter

# Install boto3 including bedrock
RUN curl -O https://d2eo22ngex1n9g.cloudfront.net/Documentation/SDK/bedrock-python-sdk.zip
RUN unzip bedrock-python-sdk.zip

RUN python3 -m pip install ./botocore-*.whl --no-cache-dir \
    && python3 -m pip install ./boto3-*.whl --no-cache-dir

RUN pip3 install -r requirements.txt --no-cache-dir

ENV PORT=8000
EXPOSE ${PORT}
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]