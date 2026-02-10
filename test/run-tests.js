#!/usr/bin/env node

import { existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { log, logInfo, logSuccess, logError, logWarning, sleep, formatTestResults } from './utils/log.js';
import { runCommand, buildApp, startSpin, killSpin, cleanup } from './utils/process.js';
import { checkDocker, startContainer, stopContainer, waitForContainer, waitForHttp } from './utils/docker.js';
import { testSourcemaps } from './utils/sourcemap.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const POSTGRES_CONTAINER = 'spin-test-postgres';
const MYSQL_CONTAINER = 'spin-test-mysql';
const POSTGRES_PORT = 5432;
const MYSQL_PORT = 3306;
const SPIN_PORT = 3000;

const args = process.argv.slice(2);
const skipBuild = args.includes('--skip-build');
const verbose = args.includes('--verbose');

const startedContainers = [];

// ── Signal handlers ──────────────────────────────────────────────────

const doCleanup = () => cleanup(false, stopContainer, startedContainers);
process.on('SIGINT', async () => { await doCleanup(); process.exit(130); });
process.on('SIGTERM', async () => { await doCleanup(); process.exit(143); });
process.on('uncaughtException', async (error) => {
  logError(error.message);
  await doCleanup();
  process.exit(1);
});

// ── Package building ─────────────────────────────────────────────────

function getPackages() {
  const dir = join(__dirname, '..', 'packages');
  if (!existsSync(dir)) return [];
  try {
    return readdirSync(dir).filter(e => {
      const p = join(dir, e);
      return statSync(p).isDirectory() && existsSync(join(p, 'package.json'));
    });
  } catch (error) {
    logError(`Failed to read packages: ${error.message}`);
    return [];
  }
}

async function buildPackages() {
  log('\n📦 Building packages...', '\x1b[1m\x1b[34m');
  const packagesDir = join(__dirname, '..', 'packages');
  const packages = getPackages();
  if (packages.length === 0) { logWarning('No packages found'); return true; }

  logInfo(`Found ${packages.length} packages: ${packages.join(', ')}`);
  for (const pkg of packages) {
    const pkgDir = join(packagesDir, pkg);
    if (!runCommand('npm install', pkgDir, verbose) || !runCommand('npm run build', pkgDir, verbose)) {
      throw new Error(`Package build failed: ${pkg}`);
    }
    logSuccess(`Built ${pkg}`);
  }
  logSuccess('All packages built');
}

// ── App testing (spin up + /testAll) ─────────────────────────────────

async function testApp(appName, appDir) {
  log(`\n🧪 Testing: ${appName}`, '\x1b[1m\x1b[35m');

  if (!buildApp(appDir, verbose)) { logError(`Failed to build ${appName}`); return false; }
  logSuccess(`${appName} built`);

  const spinProcess = startSpin(appDir, verbose);
  if (!await waitForHttp(`http://localhost:${SPIN_PORT}/health`)) {
    killSpin(spinProcess);
    return false;
  }

  let testPassed = false;
  try {
    const response = await fetch(`http://localhost:${SPIN_PORT}/testAll`);
    const ct = response.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const result = await response.json();
      formatTestResults(result);
      testPassed = result.success;
    } else {
      console.log(await response.text());
      testPassed = response.ok;
    }
  } catch (error) {
    logError(`Test request failed: ${error.message}`);
  }

  killSpin(spinProcess);
  await sleep(1000);
  return testPassed;
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  log('\n🚀 Spin JS SDK Test Runner\n', '\x1b[1m\x1b[34m');
  let exitCode = 0;

  try {
    if (!checkDocker()) return 1;
    if (!skipBuild) await buildPackages();

    const postgresOk = startContainer(POSTGRES_CONTAINER, 'postgres:15', POSTGRES_PORT,
      { POSTGRES_DB: 'spin_test', POSTGRES_USER: 'postgres', POSTGRES_PASSWORD: 'postgres' },
      startedContainers, verbose);
    const mysqlOk = startContainer(MYSQL_CONTAINER, 'mysql:8.0', MYSQL_PORT,
      { MYSQL_ROOT_PASSWORD: 'root', MYSQL_DATABASE: 'spin_test' },
      startedContainers, verbose);
    if (!postgresOk || !mysqlOk) throw new Error('Failed to start containers');

    const dbsReady =
      await waitForContainer(POSTGRES_CONTAINER, `docker exec ${POSTGRES_CONTAINER} pg_isready -U postgres`) &&
      await waitForContainer(MYSQL_CONTAINER, `docker exec ${MYSQL_CONTAINER} mysqladmin ping -h localhost -u root -proot`);
    if (!dbsReady) throw new Error('Databases not ready');

    const testApps = ['test-app'];
    for (const appName of testApps) {
      const appDir = join(__dirname, 'apps', appName);
      if (!existsSync(appDir)) { logWarning(`App not found: ${appName}`); continue; }
      if (!await testApp(appName, appDir)) exitCode = 1;
    }

    const debuggerTestDir = join(__dirname, 'apps', 'debugger-testing');
    if (!await testSourcemaps(debuggerTestDir, verbose)) exitCode = 1;

  } catch (error) {
    logError(error.message);
    if (verbose) console.error(error);
    exitCode = 1;
  } finally {
    await doCleanup();
  }

  log('');
  log(exitCode === 0 ? '✓ All tests passed!' : '✗ Some tests failed',
    exitCode === 0 ? '\x1b[1m\x1b[32m' : '\x1b[1m\x1b[31m');
  log('');
  return exitCode;
}

main().then(code => process.exit(code));
