// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

// Load environment variables first (optional)
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // dotenv is optional - continue without it if not available
  console.log('dotenv not available, skipping .env.local loading');
}

const opentelemetry = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { alibabaCloudEcsDetector } = require('@opentelemetry/resource-detector-alibaba-cloud');
const { awsEc2Detector, awsEksDetector } = require('@opentelemetry/resource-detector-aws');
const { containerDetector } = require('@opentelemetry/resource-detector-container');
const { gcpDetector } = require('@opentelemetry/resource-detector-gcp');
const { envDetector, hostDetector, osDetector, processDetector } = require('@opentelemetry/resources');

// Check if required environment variables are set
if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  console.warn('OTEL_EXPORTER_OTLP_ENDPOINT not set. Traces will not be exported.');
}

if (!process.env.OTEL_EXPORTER_OTLP_HEADERS) {
  console.warn('OTEL_EXPORTER_OTLP_HEADERS not set. Authentication may fail.');
}

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [
    getNodeAutoInstrumentations({
      // disable fs instrumentation to reduce noise
      '@opentelemetry/instrumentation-fs': {
        enabled: true,
      },
    })
  ],
  // Remove metrics for now to avoid compatibility issues
  // metricReader: new PeriodicExportingMetricReader({
  //   exporter: new OTLPMetricExporter(),
  // }),
  resourceDetectors: [
    containerDetector,
    envDetector,
    hostDetector,
    osDetector,
    processDetector,
    alibabaCloudEcsDetector,
    awsEksDetector,
    awsEc2Detector,
    gcpDetector,
  ],
});

sdk.start();

console.log('OpenTelemetry instrumentation started');
console.log('OTLP Endpoint:', process.env.OTEL_EXPORTER_OTLP_ENDPOINT);
console.log('OTLP Protocol:', process.env.OTEL_EXPORTER_OTLP_PROTOCOL || 'http/protobuf (default)');