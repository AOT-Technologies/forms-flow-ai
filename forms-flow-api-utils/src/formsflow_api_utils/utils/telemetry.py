"""This exposes Opentelemetry service."""

import os

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import (
    OTLPSpanExporter,
)
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor


def setup_tracing(app, service_name):
    """Sets up OpenTelemetry tracing for the application."""
    # Check if OpenTelemetry tracing is enabled
    if os.getenv("ENABLE_OPENTELEMETRY", "false").lower() != "true":
        print("OpenTelemetry tracing is disabled.")
        return

    resource = Resource.create({"service.name": service_name})
    trace_provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(trace_provider)

    # Configure the OTLP exporter to send data to the OpenTelemetry Collector
    otlp_endpoint = os.getenv("OTLP_ENDPOINT")
    otlp_exporter = OTLPSpanExporter(endpoint=otlp_endpoint, insecure=True)

    # Add the OTLP exporter to the tracer provider
    otlp_span_processor = BatchSpanProcessor(otlp_exporter)
    trace_provider.add_span_processor(otlp_span_processor)

    FlaskInstrumentor().instrument_app(app)
    RequestsInstrumentor().instrument()
