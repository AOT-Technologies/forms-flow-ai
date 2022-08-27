#Author: Kurian Benoy
FROM python:3.9-slim-buster

WORKDIR /forms-flow-api/app

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
RUN chmod u+x ./entrypoint.sh
ENTRYPOINT ["/bin/sh", "entrypoint.sh"]
