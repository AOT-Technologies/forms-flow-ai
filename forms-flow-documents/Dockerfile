# Author: Kurian Benoy
FROM python:3.12.6-slim

# Set label for the image
LABEL Name="formsflow"

# Set working directory
WORKDIR /forms-flow-documents/app

# Install necessary dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       gnupg2 \
       curl \
       wget \
       unzip \
       git \
       ca-certificates \
       xvfb \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV CHROMEDRIVER_VERSION=116.0.5845.96
ENV CHROMEDRIVER_DIR=/usr/local/bin

# Download and install Chromedriver
RUN wget -q "https://storage.googleapis.com/chrome-for-testing-public/131.0.6778.85/linux64/chromedriver-linux64.zip" \
    && unzip chromedriver-linux64.zip -d /usr/local/bin \
    && rm chromedriver-linux64.zip \
    && chmod +x /usr/local/bin/chromedriver

# Install Google Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Set display port to avoid crash
ENV DISPLAY=:99

# Install Python dependencies
COPY requirements.txt .
ENV PATH=/venv/bin:$PATH

RUN python3 -m venv /venv \
    && /venv/bin/pip install --upgrade pip \
    && /venv/bin/pip install -r requirements.txt

# Add application code
ADD . /forms-flow-documents/app

# Install the application in editable mode
RUN /venv/bin/pip install -e .

# Expose application port
EXPOSE 5006

# Make the entrypoint script executable
RUN chmod +x ./entrypoint

# Set entrypoint
ENTRYPOINT ["/bin/sh", "entrypoint"]
