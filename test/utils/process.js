import { spawn, execSync } from 'child_process';
import { sleep } from './log.js';

const runningProcesses = [];

function runCommand(command, cwd, verbose) {
  try {
    execSync(command, { cwd, stdio: verbose ? 'inherit' : 'pipe' });
    return true;
  } catch (error) {
    if (!verbose) {
      if (error.stdout) console.error(error.stdout.toString());
      if (error.stderr) console.error(error.stderr.toString());
    }
    return false;
  }
}

function buildApp(appDir, verbose) {
  return runCommand('npm install', appDir, verbose) && runCommand('spin build', appDir, verbose);
}

function startSpin(appDir, verbose) {
  const proc = spawn('spin', ['up'], {
    cwd: appDir, stdio: verbose ? 'inherit' : 'ignore', detached: false
  });
  runningProcesses.push(proc);
  return proc;
}

function killSpin(proc) {
  proc.kill();
  const i = runningProcesses.indexOf(proc);
  if (i > -1) runningProcesses.splice(i, 1);
}

async function cleanup(keepContainers, stopContainer, startedContainers) {
  const { log } = await import('./log.js');
  log('\n🧹 Cleaning up...', '\x1b[1m\x1b[34m');
  for (const proc of runningProcesses) {
    try {
      if (!proc?.killed) {
        proc.kill('SIGTERM');
        await sleep(500);
        if (!proc.killed) proc.kill('SIGKILL');
      }
    } catch {}
  }
  if (!keepContainers) {
    for (const name of startedContainers) stopContainer(name);
  }
}

export { runCommand, buildApp, startSpin, killSpin, cleanup, runningProcesses };
