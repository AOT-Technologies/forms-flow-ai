FROM python:3.13.2-slim-bullseye

LABEL project="formsflow-data-layer"

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/venv/bin:$PATH"

# Set working directory
WORKDIR /formsflow-data-layer

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Copy and install dependencies
COPY requirements/base.txt .

RUN python3 -m venv /venv \
    && pip install --upgrade pip \
    && pip install -r base.txt


# Copy only necessary files
COPY src/ ./src
COPY README.md .
COPY main.py ./main.py
COPY requirements.txt ./requirements.txt

# Install the package
RUN pip install -r requirements.txt

# Security: Add non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /formsflow-data-layer
USER appuser

# Expose port
EXPOSE 8000

# Start Uvicorn server directly
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
