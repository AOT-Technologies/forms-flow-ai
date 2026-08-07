#Author: Kurian Benoy
FROM python:3.13.9-slim-bookworm

# set label for image
LABEL Name="formsflow"

# Copy API utils into working directory
COPY forms-flow-api-utils /forms-flow-documents/forms-flow-api-utils

WORKDIR /forms-flow-documents/app

# install curl, gnupg2 and unzip
RUN  apt-get update \
  && apt-get install -y --no-install-recommends \
    gnupg2 curl wget unzip git \
  && rm -rf /var/lib/apt/lists/*

# Install Chrome WebDriver - version 116.0.5845.96
RUN mkdir -p /opt/chromedriver && \
    curl -sS -o /tmp/chromedriver_linux64.zip https://formsflow-documentsapi.aot-technologies.com/chromedriver-linux64.zip && \
    unzip -qq /tmp/chromedriver_linux64.zip -d /opt/chromedriver && \
    rm /tmp/chromedriver_linux64.zip && \
    chmod +x /opt/chromedriver/chromedriver-linux64/chromedriver && \
    ln -fs /opt/chromedriver/chromedriver-linux64/chromedriver /usr/local/bin/chromedriver

# Install Google Chrome
RUN wget --no-verbose -O /tmp/chrome.deb https://formsflow-documentsapi.aot-technologies.com/google-chrome-stable_116.0.5845.140-1_amd64.deb &&\
    apt-get update  && \
    apt-get -f install -y /tmp/chrome.deb &&\
    rm /tmp/chrome.deb


# set display port to avoid crash
ENV DISPLAY=:99

COPY forms-flow-documents/requirements.txt .
ENV PATH=/venv/bin:$PATH

RUN : \
    && python3 -m venv /venv \
    && pip install --upgrade pip \
    && pip install -r requirements.txt 

COPY forms-flow-documents/ .
RUN pip install -e . && \
    pip uninstall ecdsa -y && \
    apt-get remove -y \
    git unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    forms-flow-api/forms-flow-api-utils/* \
    /forms-flow-api/forms-flow-api-utils/*


EXPOSE 5006
RUN chmod u+x ./entrypoint
ENTRYPOINT ["/bin/sh", "entrypoint"]