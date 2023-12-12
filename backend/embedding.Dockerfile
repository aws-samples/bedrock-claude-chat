FROM public.ecr.aws/lambda/python:3.11

COPY ./embedding.requirements.txt ./requirements.txt
RUN pip3 install -r requirements.txt --no-cache-dir

COPY ./embedding ./embedding
COPY ./app ./app

CMD ["embedding.main.handler"]