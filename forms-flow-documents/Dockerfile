#Author: Kurian Benoy
FROM python:3.13.16-slim-trixie

# set label for image
LABEL Name="formsflow"

WORKDIR /forms-flow-documents/app

# Apply OS security patches and install Chromium with its matching ChromeDriver
# from the Debian archive (security-patched by Debian, available for amd64 and
# arm64). git is needed only to install formsflow_api_utils and is removed below.
RUN  apt-get update \
  && apt-get upgrade -y \
  && apt-get install -y --no-install-recommends \
       ca-certificates chromium chromium-driver fonts-liberation git \
  && ln -fs /usr/bin/chromedriver /usr/local/bin/chromedriver \
  && rm -rf /var/lib/apt/lists/*


# set display port to avoid crash
ENV DISPLAY=:99

COPY requirements.txt .
ENV PATH=/venv/bin:$PATH

RUN : \
    && python3 -m venv /venv \
    && pip install --upgrade pip \
    && pip install -r requirements.txt 

ADD . /forms-flow-documents/app
# pip is removed from the venv and the base image because it is not needed at
# runtime and bundles outdated certifi/urllib3/msgpack.
RUN pip install -e . && \
    pip uninstall ecdsa pip -y && \
    /usr/local/bin/python3 -m pip uninstall -y pip && \
    apt-get purge -y --auto-remove git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 5006
RUN chmod u+x ./entrypoint
ENTRYPOINT ["/bin/sh", "entrypoint"]