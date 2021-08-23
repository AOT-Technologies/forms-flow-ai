FROM docker.io/python:3.8.5-buster

ARG SOURCE_REPO=BCDevOps
ARG GOCROND_VERSION=0.6.2
ARG VCS_REF="missing"
ARG BUILD_DATE="missing"

ENV VCS_REF=${VCS_REF}
ENV BUILD_DATE=${BUILD_DATE}

LABEL org.label-schema.vcs-ref=${VCS_REF} \
    org.label-schema.build-date=${BUILD_DATE}

RUN curl https://github.com/$SOURCE_REPO/go-crond/releases/download/$GOCROND_VERSION/go-crond-64-linux -s -L -o /usr/local/bin/go-crond
RUN chmod ug+x /usr/local/bin/go-crond
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

RUN python -m nltk.downloader punkt vader_lexicon subjectivity

USER $user
ENTRYPOINT ["bash", "docker-entrypoint.sh"]
