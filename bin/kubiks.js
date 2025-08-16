#!/usr/bin/env node

const { spawn } = require('node:child_process');
const { join, dirname } = require('node:path');
const { platform, arch } = require('node:os');

// Determine the binary path based on platform and architecture
function getBinaryPath() {
  const platformMap = {
    'darwin': 'darwin',
    'linux': 'linux'
  };

  const archMap = {
    'x64': 'amd64',
    'arm64': 'arm64'
  };

  const platformName = platformMap[platform()];
  const archName = archMap[arch()];

  if (!platformName || !archName) {
    throw new Error(`Unsupported platform: ${platform()} ${arch()}`);
  }

  return join(__dirname, '..', 'dist-bin', `${platformName}-${archName}`, 'kubiks');
}

// Execute the Go binary
function main() {
  try {
    const binaryPath = getBinaryPath();
    const args = process.argv.slice(2);

    const child = spawn(binaryPath, args, {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('error', (err) => {
      console.error(`Failed to start kubiks: ${err.message}`);
      process.exit(1);
    });

    child.on('exit', (code) => {
      process.exit(code);
    });

    // Handle process termination
    process.on('SIGINT', () => child.kill('SIGINT'));
    process.on('SIGTERM', () => child.kill('SIGTERM'));

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
