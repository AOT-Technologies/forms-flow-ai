#Author: Kurian Benoy
FROM python:3.8

WORKDIR /forms-flow-api/app
COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install psycopg2
RUN pip install -r requirements.txt

ADD . /forms-flow-api/app
RUN pip install .
RUN python -m nltk.downloader punkt vader_lexicon subjectivity

EXPOSE 5000
RUN chmod u+x ./entrypoint
ENTRYPOINT ["/bin/sh", "entrypoint"]
