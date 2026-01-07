FROM python:3.13.9-slim-bookworm

LABEL project="formsflow-data-layer"

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/venv/bin:$PATH"

WORKDIR /formsflow-data-layer

# Install system dependencies & clean up
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN python3 -m venv /venv && \
    /venv/bin/pip install --upgrade pip && \
    /venv/bin/pip install -r requirements.txt

# Copy app files
COPY src/ ./src
COPY main.py .

# Security: Add non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /formsflow-data-layer \
      && pip uninstall -y ecdsa
USER appuser

EXPOSE 8000

# Start Uvicorn server with parameterized workers
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port 8000 --workers ${FOMRSFLOW_DATA_LAYER_WORKERS:-4}"]
