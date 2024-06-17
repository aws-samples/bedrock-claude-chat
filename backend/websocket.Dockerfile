FROM public.ecr.aws/lambda/python:3.11

COPY ./pyproject.toml ./poetry.lock ./
RUN pip install poetry --no-cache-dir && \
    poetry config virtualenvs.create false && \
    poetry install --no-interaction --no-ansi

COPY ./app ./app

CMD ["app.websocket.handler"]