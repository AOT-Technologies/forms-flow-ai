FROM python:3.13.9-slim-bookworm

ARG SOURCE_REPO=BCDevOps
ARG GOCROND_VERSION=0.6.2
# SHA-256 of go-crond-64-linux for GOCROND_VERSION; update both together
ARG GOCROND_SHA256=b7d27bcf12b2e2b3f7fd3b90d9f94cf5ee61dd385f4cd58ce3dec25434613b14
ARG VCS_REF="missing"
ARG BUILD_DATE="missing"
ARG MODEL_ID=xaqren/sentiment_analysis

ENV MODEL_ID=${MODEL_ID}
ENV VCS_REF=${VCS_REF}
ENV BUILD_DATE=${BUILD_DATE}

LABEL org.label-schema.vcs-ref=${VCS_REF} \
    org.label-schema.build-date=${BUILD_DATE}

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL -o /usr/local/bin/go-crond \
        https://github.com/$SOURCE_REPO/go-crond/releases/download/$GOCROND_VERSION/go-crond-64-linux \
    && echo "$GOCROND_SHA256  /usr/local/bin/go-crond" | sha256sum -c - \
    && chmod ug+x /usr/local/bin/go-crond
# ========================================================================================================

# Add a job user
ARG uid=1001
ARG user=formsflow
RUN useradd -U -ms /bin/bash -u $uid $user \
    && usermod -a -G root $user

ENV HOME=/sentiment-analysis

RUN mkdir $HOME && chmod 755 $HOME

WORKDIR $HOME

# Install the requirements
COPY ./requirements.txt .
COPY ./requirements/ ./requirements/
COPY . .

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Set ownership and permissions
# Set scripts as executable (make files and python files do not have to be marked)
# Make /etc/passwd writable for the root group so an entry can be created for an OpenShift assigned user account.
RUN chown -R $user:root $HOME \
    && chmod -R ug+rw $HOME \
    && chmod ug+x $HOME/*.sh \
    && chmod g+rw /etc/passwd \
    && chmod g-w $HOME/cron/crontab

RUN python3 -c "from transformers import pipeline; pipeline('sentiment-analysis', model='$MODEL_ID', truncation=True)"

USER $user
ENTRYPOINT ["bash", "docker-entrypoint.sh"]
