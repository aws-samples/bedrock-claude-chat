FROM public.ecr.aws/docker/library/python:3.11.6-slim-bookworm

# Install lambda web adapter
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.7.0 /lambda-adapter /opt/extensions/lambda-adapter

WORKDIR /backend

COPY ./requirements.txt ./
RUN pip3 install -r requirements.txt --no-cache-dir

COPY ./app ./app

ENV PORT=8000
EXPOSE ${PORT}

# TODO: 専用のrouteを作成しロードする
# ENVで使い分け？
CMD ["uvicorn", "app.main_published:app", "--host", "0.0.0.0", "--port", "8000"]