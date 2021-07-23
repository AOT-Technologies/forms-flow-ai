#Author: Kurian Benoy
FROM python:3.8

WORKDIR /forms-flow-api/app
COPY requirements/prod.txt .
ENV PATH=/venv/bin:$PATH

RUN : \
    && python3 -m venv /venv \
    && pip install --upgrade pip \
    && pip install psycopg2 \
    && pip install -r prod.txt 

ADD . /forms-flow-api/app
RUN pip install .

EXPOSE 5000
RUN chmod u+x ./entrypoint
ENTRYPOINT ["/bin/sh", "entrypoint"]
