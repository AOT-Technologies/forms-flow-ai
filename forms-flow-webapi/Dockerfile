FROM python:3.7-alpine
ENV FLASK_APP manage.py
ENV FLASK_RUN_HOST 0.0.0.0

ADD . /app
WORKDIR /app

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

RUN pip install -r requirements.txt
RUN pip install -U flask-cors

EXPOSE 5000
RUN chmod u+x ./entrypoint
ENTRYPOINT ["/bin/sh", "entrypoint"]
