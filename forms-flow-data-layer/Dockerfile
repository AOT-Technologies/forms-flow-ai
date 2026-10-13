# Author: Kurian Benoy
FROM python:3.13.9-slim-bookworm

LABEL Name="formsflow"

# Automatically set by Docker Buildx:
# amd64 or arm64
ARG TARGETARCH

WORKDIR /forms-flow-documents/app

# Common packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gnupg2 \
        curl \
        wget \
        unzip \
        git \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------------
# AMD64
# Pinned Google Chrome 116 + matching ChromeDriver from AOT CDN
# ---------------------------------------------------------------------------
RUN set -eux; \
    if [ "$TARGETARCH" = "amd64" ]; then \
        echo "Installing Google Chrome + ChromeDriver for AMD64"; \
        mkdir -p /opt/chromedriver; \
        curl -fsSL \
            -o /tmp/chromedriver_linux64.zip \
            https://formsflow-documentsapi.aot-technologies.com/chromedriver-linux64.zip; \
        unzip -qq /tmp/chromedriver_linux64.zip \
            -d /opt/chromedriver; \
        rm -f /tmp/chromedriver_linux64.zip; \
        chmod +x \
            /opt/chromedriver/chromedriver-linux64/chromedriver; \
        ln -sf \
            /opt/chromedriver/chromedriver-linux64/chromedriver \
            /usr/local/bin/chromedriver; \
        wget --no-verbose \
            -O /tmp/chrome.deb \
            https://formsflow-documentsapi.aot-technologies.com/google-chrome-stable_116.0.5845.140-1_amd64.deb; \
        apt-get update; \
        apt-get install -y --no-install-recommends /tmp/chrome.deb; \
        rm -f /tmp/chrome.deb; \
        rm -rf /var/lib/apt/lists/*; \
    fi

# ---------------------------------------------------------------------------
# ARM64
# Native Debian Chromium + native ChromiumDriver
#
# IMPORTANT:
# Do NOT download chromedriver_linux64.zip here.
# That archive is x86_64/AMD64 and cannot run on ARM64.
# ---------------------------------------------------------------------------
RUN set -eux; \
    if [ "$TARGETARCH" = "arm64" ]; then \
        echo "Installing native Chromium + ChromeDriver for ARM64"; \
        apt-get update; \
        apt-get install -y --no-install-recommends \
            chromium \
            chromium-driver; \
        rm -rf /var/lib/apt/lists/*; \
    fi

# ---------------------------------------------------------------------------
# Fail the build for unsupported architectures
# ---------------------------------------------------------------------------
RUN case "$TARGETARCH" in \
        amd64|arm64) echo "Supported architecture: $TARGETARCH" ;; \
        *) echo "Unsupported architecture: $TARGETARCH"; exit 1 ;; \
    esac

ENV DISPLAY=:99

# Python dependencies
COPY requirements.txt .

ENV PATH="/venv/bin:$PATH"

RUN python3 -m venv /venv \
    && pip install --upgrade pip \
    && pip install -r requirements.txt

# Application
COPY . /forms-flow-documents/app

RUN pip install -e . \
    && pip uninstall -y ecdsa \
    && apt-get remove -y git unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 5006

RUN chmod u+x ./entrypoint

ENTRYPOINT ["/bin/sh", "entrypoint"]