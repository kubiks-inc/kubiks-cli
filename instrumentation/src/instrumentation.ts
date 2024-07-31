import path from 'path';

/**
 * Kubiks OpenTelemetry instrumentation for Next.js applications
 * This file is bundled with all dependencies - no additional npm packages required!
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { KubiksSDK } = await import('@kubiks/otel-nextjs');

    // Get current directory name as service name
    const currentDir = process.cwd();
    const serviceName = path.basename(currentDir);

    const sdk = new KubiksSDK({
      service: serviceName,
    });

    sdk.start();
  }
}