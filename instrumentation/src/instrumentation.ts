const { KubiksSDK } = require('@kubiks/otel-nextjs');

// The service name will be automatically set from OTEL_SERVICE_NAME environment variable
// which is set by kubiks-cli when starting the Next.js app
const sdk = new KubiksSDK();

sdk.start();