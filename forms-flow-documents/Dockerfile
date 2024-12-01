#Author: Kurian Benoy
FROM python:3.12.6-slim

# set label for image
LABEL Name="formsflow"

WORKDIR /forms-flow-documents/app

# install curl, gnupg2 and unzip
RUN  apt-get update \
  && apt-get install -y gnupg2 \
  && apt-get install -y curl \
  && apt-get install -y wget \
  && apt-get install -y unzip \
  && apt-get install -y git \
  && rm -rf /var/lib/apt/lists/*

# Install Chrome WebDriver - version 116.0.5845.96
RUN apt-get update && \
    apt-get install -y gnupg wget curl unzip --no-install-recommends && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list && \
    apt-get update -y && \
    apt-get install -y google-chrome-stable && \
    CHROMEVER=$(google-chrome --product-version | grep -o "[^\.]\.[^\.]\.[^\.]*") && \
    DRIVERVER=$(curl -s "https://chromedriver.storage.googleapis.com/LATEST_RELEASE_$CHROMEVER") && \
    wget -q --continue -P /chromedriver "http://chromedriver.storage.googleapis.com/$DRIVERVER/chromedriver_linux64.zip" && \
    unzip /chromedriver/chromedriver* -d /chromedriver

# Install Google Chrome
RUN wget --no-verbose -O /tmp/chrome.deb https://formsflow-documentsapi.aot-technologies.com/google-chrome-stable_116.0.5845.140-1_amd64.deb || (echo "Failed to download Chrome package" && exit 1) && \
    apt-get update && \
    apt-get install -y /tmp/chrome.deb || (echo "Failed to install Chrome package" && exit 1) && \
    rm /tmp/chrome.deb




# set display port to avoid crash
ENV DISPLAY=:99

COPY requirements.txt .
ENV PATH=/venv/bin:$PATH

RUN : \
    && python3 -m venv /venv \
    && pip install --upgrade pip \
    && pip install -r requirements.txt 

ADD . /forms-flow-documents/app
RUN pip install -e .

EXPOSE 5006
RUN chmod u+x ./entrypoint
ENTRYPOINT ["/bin/sh", "entrypoint"]