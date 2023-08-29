FROM public.ecr.aws/lambda/python:3.11

RUN yum -y update && yum install -y curl unzip

COPY ./common .
COPY ./websocket/invoke_bedrock .


# Install boto3 including bedrock
RUN curl -O https://d2eo22ngex1n9g.cloudfront.net/Documentation/SDK/bedrock-python-sdk.zip
RUN unzip bedrock-python-sdk.zip

RUN python3 -m pip install ./botocore-*.whl --no-cache-dir \
    && python3 -m pip install ./boto3-*.whl --no-cache-dir

RUN pip3 install -r requirements.txt --no-cache-dir

CMD ["index.handler"]