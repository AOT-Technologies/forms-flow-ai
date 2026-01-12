#Author: Kurian Benoy
FROM python:3.13.9-slim-bookworm

# set label for image
LABEL Name="formsflow"

# Copy API utils into working directory
COPY forms-flow-api-utils /forms-flow-api/forms-flow-api-utils

WORKDIR /forms-flow-api/app

# install curl, gnupg2 and unzip
RUN  apt-get update \
  && apt-get install --no-install-recommends -y git 

COPY forms-flow-api/requirements.txt .
ENV PATH=/venv/bin:$PATH

RUN : \
    && python3 -m venv /venv \
    && pip install --upgrade pip \
    && pip install -r requirements.txt 

COPY forms-flow-api/ .
RUN pip install -e . \
    && pip uninstall ecdsa -y \
    && apt-get remove -y \
      sqlite3 libsqlite3-0 git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    forms-flow-api/forms-flow-api-utils/* \
    /forms-flow-api/forms-flow-api-utils/*


EXPOSE 5000
COPY forms-flow-api/wait-for-service.sh /wait-for-service.sh
RUN chmod u+x /wait-for-service.sh
RUN chmod u+x ./entrypoint.sh
ENTRYPOINT ["/bin/sh", "entrypoint.sh"]
