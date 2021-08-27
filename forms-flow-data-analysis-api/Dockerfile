#Author: Kurian Benoy
FROM python:3.8.5

WORKDIR /forms-flow-data-analysis-api/app
COPY requirements.txt .
ENV PATH=/venv/bin:$PATH
RUN pip install psycopg2

RUN : \
    && python3 -m venv /venv \
    && pip install --upgrade pip \
    && pip install psycopg2 \
    && pip install -r requirements.txt 

ADD . /forms-flow-data-analysis-api/app
RUN pip install .

EXPOSE 5001
RUN python -m nltk.downloader punkt vader_lexicon subjectivity

RUN chmod u+x ./entrypoint
ENTRYPOINT ["/bin/sh", "entrypoint"]
