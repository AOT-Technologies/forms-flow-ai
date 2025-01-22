#Author: Kurian Benoy
FROM python:3.12.6-slim

# set label for image
LABEL Name="formsflow"

WORKDIR /forms-flow-api/app

# Set build arguments for workers and threads
ARG GUNICORN_WORKERS=5
ARG GUNICORN_THREADS=10

# Set environment variables from the build arguments
ENV GUNICORN_WORKERS=${GUNICORN_WORKERS}
ENV GUNICORN_THREADS=${GUNICORN_THREADS}

# install curl, gnupg2 and unzip
RUN  apt-get update \
  && apt-get install -y git

COPY requirements.txt .
ENV PATH=/venv/bin:$PATH

RUN : \
    && python3 -m venv /venv \
    && pip install --upgrade pip \
    && pip install -r requirements.txt 

ADD . /forms-flow-api/app
RUN pip install -e .

EXPOSE 5000
COPY wait-for-service.sh /wait-for-service.sh
RUN chmod u+x /wait-for-service.sh
RUN chmod u+x ./entrypoint.sh
ENTRYPOINT ["/bin/sh", "entrypoint.sh"]
