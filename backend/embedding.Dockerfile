FROM public.ecr.aws/docker/library/python:3.11.6-slim-bullseye

RUN apt-get update && apt-get install -y \
    # https://github.com/langchain-ai/langchain/issues/3002
    libmagic-mgc libmagic1 \
    # https://stackoverflow.com/questions/55313610/importerror-libgl-so-1-cannot-open-shared-object-file-no-such-file-or-directo
    ffmpeg libsm6 libxext6 \
    # Playwright dependencies
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcb1 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*
    
ENV PYTHONPATH="${PYTHONPATH}:/src"

WORKDIR /src
COPY ./embedding.requirements.txt ./requirements.txt
RUN pip3 install -r requirements.txt --no-cache-dir

RUN playwright install

COPY ./embedding ./embedding
COPY ./app ./app

ENTRYPOINT [ "python3" ]
CMD ["-u", "embedding/main.py"]