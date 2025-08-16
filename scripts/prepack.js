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
  const env = { ...process.env, GOOS: goos, GOARCH: goarch, CGO_ENABLED: '1' };
  const main = join(__dirname, '..', 'main.go');
  const outDir = dirname(outPath);
  ensureDir(outDir);
  run(`go build -ldflags="-s -w" -o ${outPath} ${main}`, { env });
}

function main() {
  if (process.env.SKIP_PREPACK === '1' || process.env.NPM_CONFIG_IGNORE_SCRIPTS === 'true') {
    return;
  }

  const distRoot = join(__dirname, '..', 'dist-bin');
  // Determine which GOOS set to build
  const onlyGoosEnv = process.env.ONLY_GOOS && process.env.ONLY_GOOS.trim();
  const inferredGoos = !onlyGoosEnv && !process.env.CI
    ? (process.platform === 'darwin' ? 'darwin' : (process.platform === 'linux' ? 'linux' : ''))
    : '';

  // Build frontend once so go:embed picks up fresh assets
  buildUI();

  // Build supported targets
  const allTargets = [
    { goos: 'darwin', goarch: 'amd64', folder: 'darwin-amd64' },
    { goos: 'darwin', goarch: 'arm64', folder: 'darwin-arm64' },
    { goos: 'linux', goarch: 'amd64', folder: 'linux-amd64' },
    { goos: 'linux', goarch: 'arm64', folder: 'linux-arm64' },
  ];

  const goosFilter = onlyGoosEnv || inferredGoos || '';
  const goarchFilter = process.env.ONLY_GOARCH && process.env.ONLY_GOARCH.trim();
  let targets = goosFilter
    ? allTargets.filter(t => t.goos === goosFilter)
    : allTargets;
  if (goarchFilter) {
    targets = targets.filter(t => t.goarch === goarchFilter);
  }

  // Clean only the subfolders we are about to rebuild to preserve
  // artifacts produced on other runners (merged later in CI)
  for (const t of targets) {
    try { rmSync(join(distRoot, t.folder), { recursive: true, force: true }); } catch { }
  }

  for (const t of targets) {
    const outPath = join(distRoot, t.folder, 'kubiks');
    buildGoBinary(t.goos, t.goarch, outPath);
    try { chmodSync(outPath, 0o755); } catch { }
  }

  // Ensure the Node shim is executable
  try { chmodSync(join(__dirname, '..', 'bin', 'kubiks.js'), 0o755); } catch { }
}

main();


