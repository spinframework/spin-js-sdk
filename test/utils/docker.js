import { execSync } from 'child_process';
import { logSuccess, logError, sleep } from './log.js';

const STARTUP_TIMEOUT = 60000;

function checkDocker() {
  try { execSync('docker --version', { stdio: 'ignore' }); return true; }
  catch { logError('Docker is not installed or not running'); return false; }
}

function isContainerRunning(name) {
  try {
    return execSync(`docker inspect -f '{{.State.Running}}' ${name}`, { stdio: 'pipe' }).toString().trim() === 'true';
  } catch { return false; }
}

function startContainer(name, image, port, envVars, startedContainers, verbose) {
  if (isContainerRunning(name)) {
    logSuccess(`${name} already running`);
    startedContainers.push(name);
    return true;
  }
  try { execSync(`docker rm ${name}`, { stdio: 'ignore' }); } catch {}
  const envFlags = Object.entries(envVars).map(([k, v]) => `-e ${k}=${v}`).join(' ');
  try {
    execSync(`docker run -d --name ${name} -p ${port}:${port} ${envFlags} ${image}`, { stdio: 'pipe' });
    startedContainers.push(name);
    logSuccess(`${name} started`);
    return true;
  } catch (error) {
    logError(`Failed to start ${name}`);
    if (verbose) console.error(error.message);
    return false;
  }
}

function stopContainer(name) {
  try { execSync(`docker stop ${name}`, { stdio: 'ignore' }); execSync(`docker rm ${name}`, { stdio: 'ignore' }); } catch {}
}

async function waitForContainer(name, checkCommand, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { execSync(checkCommand, { stdio: 'ignore' }); logSuccess(`${name} ready`); return true; }
    catch { await sleep(1000); }
  }
  logError(`${name} not ready within ${timeout / 1000}s`);
  return false;
}

async function waitForHttp(url, timeout = STARTUP_TIMEOUT) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { if ((await fetch(url)).ok) return true; } catch {}
    await sleep(1000);
  }
  logError(`${url} not ready within ${timeout / 1000}s`);
  return false;
}

export { checkDocker, isContainerRunning, startContainer, stopContainer, waitForContainer, waitForHttp };
