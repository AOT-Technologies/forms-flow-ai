FROM python:3.8

ADD . /forms-flow-api/app
WORKDIR /forms-flow-api/app

RUN pip install --upgrade pip
RUN pip install psycopg2

RUN pip install .

EXPOSE 5000
RUN chmod u+x ./entrypoint
ENTRYPOINT ["/bin/sh", "entrypoint"]
