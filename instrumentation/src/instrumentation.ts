const { registerOTel, OTLPHttpJsonTraceExporter } = require('@vercel/otel');

registerOTel({
  serviceName: 'kubiks-cli',
  traceExporter: new OTLPHttpJsonTraceExporter({
    url: 'http://localhost:7432/v1/traces',
  }),
});
