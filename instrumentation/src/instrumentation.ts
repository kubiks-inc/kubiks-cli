import path from 'path';

const { KubiksSDK } = require('@kubiks/otel-nextjs');

// Get current directory name as service name
const currentDir = process.cwd();
const serviceName = path.basename(currentDir);

const sdk = new KubiksSDK({
  service: serviceName,
});

sdk.start();