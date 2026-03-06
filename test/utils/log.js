function log(message, color = '') { console.log(`${color}${message}\x1b[0m`); }
function logInfo(msg) { log(`ℹ ${msg}`, '\x1b[36m'); }
function logSuccess(msg) { log(`✓ ${msg}`, '\x1b[32m'); }
function logError(msg) { log(`✗ ${msg}`, '\x1b[31m'); }
function logWarning(msg) { log(`⚠ ${msg}`, '\x1b[33m'); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function formatTestResults(result) {
  console.log('');
  log(`📊 ${result.appName || 'Test'} — ${result.passed}/${result.total} passed`, '\x1b[1m');
  for (const test of result.results || []) {
    const name = test.test || test.endpoint || 'Unknown';
    if (test.passed) {
      log(`  ✓ ${name}`, '\x1b[32m');
    } else {
      log(`  ✗ ${name}`, '\x1b[31m');
      if (test.error) log(`    ${test.error}`, '\x1b[90m');
    }
  }
  console.log('');
}

function createChecker() {
  const results = [];
  const check = (name, passed, error) => results.push({ endpoint: name, passed, ...(error && { error }) });
  const summary = (appName) => {
    const passed = results.filter(r => r.passed).length;
    formatTestResults({ appName, total: results.length, passed, failed: results.length - passed, results });
    return results.every(r => r.passed);
  };
  return { check, summary };
}

export { log, logInfo, logSuccess, logError, logWarning, sleep, formatTestResults, createChecker };
