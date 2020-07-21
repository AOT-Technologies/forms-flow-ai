FROM python:3.7-alpine

ADD . /forms-flow-api/app
WORKDIR /forms-flow-api/app

RUN apk update \
  && apk add \
  build-base \
  postgresql \
  postgresql-dev \
  libpq \
  libressl-dev \
  libffi-dev \
  unixodbc-dev \
  gcc \
  python3-dev \
  musl-dev
RUN pip install psycopg2

RUN pip install .

EXPOSE 5000
RUN chmod u+x ./entrypoint
ENTRYPOINT ["/bin/sh", "entrypoint"]
