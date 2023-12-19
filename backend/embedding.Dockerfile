FROM public.ecr.aws/docker/library/python:3.11.6-slim-bullseye

# Ref: https://github.com/langchain-ai/langchain/issues/3002
RUN apt-get update && apt-get install -y \
    libmagic-mgc \
    libmagic1 \
    ffmpeg libsm6 libxext6

ENV PYTHONPATH="${PYTHONPATH}:/src"

WORKDIR /src
COPY ./embedding.requirements.txt ./requirements.txt
RUN pip3 install -r requirements.txt --no-cache-dir

COPY ./embedding ./embedding
COPY ./app ./app

ENTRYPOINT [ "python3" ]
CMD ["-u", "embedding/main.py"]