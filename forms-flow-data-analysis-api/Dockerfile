#Author: Kurian Benoy
FROM python:3.8.5

WORKDIR /forms-flow-data-analysis-api/app
COPY requirements.txt .
ENV PATH=/venv/bin:$PATH
ARG MODEL_ID=Seethal/sentiment_analysis_generic_dataset

RUN : \
    && python3 -m venv /venv \
    && pip install --default-timeout=1000 -r requirements.txt 

ADD . /forms-flow-data-analysis-api/app
RUN pip install .

EXPOSE 5001
RUN python3 -c "from transformers import pipeline; pipeline('sentiment-analysis', model='$MODEL_ID', truncation=True)"

RUN chmod u+x ./entrypoint
ENTRYPOINT ["/bin/sh", "entrypoint"]
