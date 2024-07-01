FROM public.ecr.aws/docker/library/python:3.11.6-slim-bookworm

ENV PYTHONPATH="${PYTHONPATH}:/src"

RUN apt-get update && apt-get install -y \
    build-essential cmake \
    poppler-utils tesseract-ocr \
    # opencv package requirements
    libgl1 \
    libglib2.0-0 \
    # unstructured package requirements for file type detection
    libmagic-mgc libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Playwright dependencies
RUN apt-get update && apt-get install -y \
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

WORKDIR /src

COPY ./embedding/pyproject.toml ./embedding/poetry.lock ./
RUN pip install poetry --no-cache-dir && \
    poetry config virtualenvs.create false && \
    poetry install --no-interaction --no-ansi

RUN playwright install chromium

# Install NLTK and tokenizers and taggers
# Ref: https://www.nltk.org/data.html
RUN python -m nltk.downloader -d /usr/local/share/nltk_data punkt averaged_perceptron_tagger stopwords
# Set NLTK_DATA environment variable
ENV NLTK_DATA /usr/local/share/nltk_data

COPY ./embedding ./embedding
COPY ./app ./app

ENTRYPOINT [ "python3" ]
CMD ["-u", "embedding/main.py"]
