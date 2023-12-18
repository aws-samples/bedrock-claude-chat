FROM public.ecr.aws/docker/library/python:3.11.6-slim-bullseye

ENV PYTHONPATH="${PYTHONPATH}:/src"

WORKDIR /src
COPY ./embedding.requirements.txt ./requirements.txt
RUN pip3 install -r requirements.txt --no-cache-dir

COPY ./embedding ./embedding
COPY ./app ./app

ENTRYPOINT [ "python3" ]
CMD ["-u", "embedding/main.py"]