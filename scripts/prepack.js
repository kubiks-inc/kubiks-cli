#!/usr/bin/env node

const { execSync } = require('node:child_process');
const { mkdirSync, copyFileSync, rmSync, chmodSync } = require('node:fs');
const { join, dirname } = require('node:path');

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: 'inherit', ...opts });
}

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function buildUI() {
  run('npm ci --silent', { cwd: join(__dirname, '..', 'ui') });
  run('npm run build --silent', { cwd: join(__dirname, '..', 'ui') });
}

function buildGoBinary(goos, goarch, outPath) {
  const env = { ...process.env, GOOS: goos, GOARCH: goarch, CGO_ENABLED: '0' };
  const main = join(__dirname, '..', 'main.go');
  const outDir = dirname(outPath);
  ensureDir(outDir);
  run(`go build -ldflags="-s -w" -o ${outPath} ${main}`, { env });
}

function main() {
  const distRoot = join(__dirname, '..', 'dist-bin');
  // Clean dist-bin to avoid stale artifacts
  try { rmSync(distRoot, { recursive: true, force: true }); } catch { }

  // Build frontend once so go:embed picks up fresh assets
  buildUI();

  // Build supported targets
  const targets = [
    { goos: 'darwin', goarch: 'amd64', folder: 'darwin-amd64' },
    { goos: 'darwin', goarch: 'arm64', folder: 'darwin-arm64' },
    { goos: 'linux', goarch: 'amd64', folder: 'linux-amd64' },
    { goos: 'linux', goarch: 'arm64', folder: 'linux-arm64' },
  ];

  for (const t of targets) {
    const outPath = join(distRoot, t.folder, 'kubiks');
    buildGoBinary(t.goos, t.goarch, outPath);
    try { chmodSync(outPath, 0o755); } catch { }
  }

  // Ensure the Node shim is executable
  try { chmodSync(join(__dirname, '..', 'bin', 'kubiks.js'), 0o755); } catch { }
}

main();


