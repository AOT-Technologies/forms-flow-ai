#Author: Kurian Benoy
FROM python:3.12.1-slim-bullseye

# set label for image
LABEL Name="formsflow"

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
COPY wait-for-service.sh /wait-for-service.sh
RUN chmod u+x /wait-for-service.sh
RUN chmod u+x ./entrypoint.sh
ENTRYPOINT ["/bin/sh", "entrypoint.sh"]
