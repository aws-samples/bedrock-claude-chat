FROM public.ecr.aws/lambda/python:3.11

RUN yum -y update && yum install -y curl unzip

COPY ./common .
COPY ./websocket/invoke_bedrock .


RUN pip3 install -r requirements.txt --no-cache-dir

CMD ["index.handler"]