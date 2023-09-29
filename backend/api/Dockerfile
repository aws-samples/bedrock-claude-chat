FROM public.ecr.aws/docker/library/python:3.11.4-slim-bullseye

RUN apt update && apt install -y curl unzip

WORKDIR /app
COPY ./common .
COPY ./api .

# Install lambda web adapter
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.7.0 /lambda-adapter /opt/extensions/lambda-adapter

RUN pip3 install -r requirements.txt --no-cache-dir

ENV PORT=8000
EXPOSE ${PORT}
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]