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
#RUN apt-get install -y wget xvfb unzip
# Set up the Chrome PPA
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list
# Update the package list and install chrome
RUN apt-get update -y
RUN apt-get install -y google-chrome-stable
# Set up Chromedriver Environment variables
ENV CHROMEDRIVER_VERSION 2.19
ENV CHROMEDRIVER_DIR /chromedriver
RUN mkdir $CHROMEDRIVER_DIR
# Download and install Chromedriver
RUN wget -q --continue -P $CHROMEDRIVER_DIR "http://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip"
RUN unzip $CHROMEDRIVER_DIR/chromedriver* -d $CHROMEDRIVER_DIR
# Put Chromedriver into the PATH
ENV PATH $CHROMEDRIVER_DIR:$PATH

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