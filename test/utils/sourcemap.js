import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { log, logSuccess, logError, createChecker } from './log.js';
import { runCommand } from './process.js';

// Source Map V3 VLQ: each segment is [genCol, srcIdx, origLine, origCol, nameIdx?].
// Semicolons = generated lines, commas = segments. All values are deltas.
function decodeVLQ(str) {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const values = [];
  let i = 0;
  while (i < str.length) {
    let value = 0, shift = 0, cont;
    do {
      const digit = CHARS.indexOf(str[i++]);
      cont = digit & 32;
      value += (digit & 31) << shift;
      shift += 5;
    } while (cont);
    values.push((value & 1) ? -(value >> 1) : (value >> 1));
  }
  return values;
}

function decodeMappings(mappings) {
  const decoded = [];
  let srcIdx = 0, origLine = 0, origCol = 0;
  for (const line of mappings.split(';')) {
    for (const seg of line.split(',').filter(Boolean)) {
      const v = decodeVLQ(seg);
      if (v.length >= 4) {
        srcIdx += v[1];
        origLine += v[2];
        origCol += v[3];
        decoded.push({ sourceIndex: srcIdx, line: origLine, column: origCol });
      }
    }
  }
  return decoded;
}

// Validate a source map: check it references a .ts source and mappings
// point to valid lines in that source file.
function validateSourceMap(mapPath, jsPath, tsSourcePath, check) {
  const jsContent = readFileSync(jsPath, 'utf-8');
  check('sourceMappingURL present', jsContent.includes('sourceMappingURL'),
    !jsContent.includes('sourceMappingURL') && 'no sourceMappingURL comment');

  let sourceMap;
  try { sourceMap = JSON.parse(readFileSync(mapPath, 'utf-8')); }
  catch (e) { check('valid source map', false, e.message); return; }

  const sources = sourceMap.sources || [];
  const tsFile = tsSourcePath.split('/').pop();
  const tsIndex = sources.findIndex(s => s.includes(tsFile));
  check(`maps back to ${tsFile}`, sourceMap.version === 3 && tsIndex >= 0,
    tsIndex < 0 ? `sources: ${JSON.stringify(sources)}` : sourceMap.version !== 3 && `version ${sourceMap.version}`);

  if (tsIndex >= 0 && sourceMap.mappings) {
    const decoded = decodeMappings(sourceMap.mappings);
    const tsMappings = decoded.filter(m => m.sourceIndex === tsIndex);
    const lineCount = readFileSync(tsSourcePath, 'utf-8').split('\n').length;
    const uniqueLines = new Set(tsMappings.map(m => m.line));
    const inRange = tsMappings.every(m => m.line >= 0 && m.line < lineCount);

    check('mappings resolve to .ts source', tsMappings.length > 0 && inRange && uniqueLines.size > 1,
      tsMappings.length === 0 ? 'no segments point to source'
        : !inRange ? `some lines outside 0-${lineCount - 1}`
        : uniqueLines.size <= 1 && `only maps to line ${[...uniqueLines].join(', ')}`);
  }
}

// spin-ts: validates tsc sourcemap and that
// apps without regex precompilation build and produce correct artifacts.
async function testSpinTs(testDir, verbose) {
  log(`\n🗺️  Testing: sourcemap (spin-ts)`, '\x1b[1m\x1b[35m');

  const appDir = join(testDir, 'spin-ts');
  if (!existsSync(appDir)) { logError('spin-ts not found'); return false; }

  if (!runCommand('npm install', appDir, verbose) || !runCommand('spin build', appDir, verbose)) {
    logError('Failed to build spin-ts'); return false;
  }
  logSuccess('spin-ts built');

  const { check, summary } = createChecker();
  const wasmPath = join(appDir, 'dist', 'spin-ts.wasm');
  const jsPath = join(appDir, 'dist', 'index.js');
  const mapPath = join(appDir, 'dist', 'index.js.map');

  const artifactsExist = [wasmPath, jsPath, mapPath].every(p => existsSync(p));
  check('build artifacts produced', artifactsExist, !artifactsExist && 'missing wasm, js, or map file');
  if (artifactsExist) validateSourceMap(mapPath, jsPath, join(appDir, 'src', 'index.ts'), check);

  return summary('spin-ts');
}

// chained-sourcemaps: precompiles
// regexes and chains the esbuild source map with its own transform.
// The final precompiled-source.js.map must trace back to the original .ts.
async function testChainedSourcemaps(testDir, verbose) {
  log(`\n🗺️  Testing: sourcemap (chained-sourcemaps)`, '\x1b[1m\x1b[35m');

  const appDir = join(testDir, 'chained-sourcemaps');
  if (!existsSync(appDir)) { logError('chained-sourcemaps not found'); return false; }

  if (!runCommand('npm install', appDir, verbose) || !runCommand('npm run build:debug', appDir, verbose)) {
    logError('Failed to build chained-sourcemaps'); return false;
  }
  logSuccess('chained-sourcemaps built');

  const { check, summary } = createChecker();
  const wasmPath = join(appDir, 'dist', 'chained-sourcemaps.wasm');
  const jsPath = join(appDir, 'build', 'precompiled-source.js');
  const mapPath = join(appDir, 'build', 'precompiled-source.js.map');

  const artifactsExist = [wasmPath, jsPath, mapPath].every(p => existsSync(p));
  check('build artifacts produced', artifactsExist, !artifactsExist && 'missing wasm, js, or map file');
  if (artifactsExist) validateSourceMap(mapPath, jsPath, join(appDir, 'src', 'index.ts'), check);

  return summary('chained-sourcemaps');
}

async function testSourcemaps(testDir, verbose) {
  const spinTsOk = await testSpinTs(testDir, verbose);
  const chainedOk = await testChainedSourcemaps(testDir, verbose);
  return spinTsOk && chainedOk;
}

export { testSourcemaps };
