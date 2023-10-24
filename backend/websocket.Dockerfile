FROM public.ecr.aws/lambda/python:3.11

COPY ./requirements.txt ./
RUN pip3 install -r requirements.txt --no-cache-dir

COPY ./app ./app

CMD ["app.websocket.handler"]