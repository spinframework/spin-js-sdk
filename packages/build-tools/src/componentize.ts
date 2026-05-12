import { componentize as componentizeJs } from '@bytecodealliance/componentize-js';
import { version as componentizeVersion } from '@bytecodealliance/componentize-js';
import { getPackagesWithWasiDeps, processWasiDeps } from './wasiDepsParser.js';
import {
  calculateChecksum,
  chainSourceMaps,
  fileExists,
  getSourceMapFromFile,
  saveBuildData,
} from './utils.js';
import { getBuildDataPath, ShouldComponentize } from './build.js';
import { readFile, writeFile } from 'node:fs/promises';
import { mergeWit } from '../lib/wit_tools.js';
//@ts-ignore
import { precompile } from "./precompile.js"
import path from 'node:path';
import { SourceMapInput } from '@ampproject/remapping';
import { getSpinComponentDependencies } from './spinComponentDeps.js';
import { mkdirSync } from 'node:fs';

export interface ComponentizeOptions {
  /**
   * Path to the bundled JS input file. Defaults to './build/bundle.js'.
   */
  input?: string;
  /**
   * Path to the output wasm file. Defaults to './dist/<dirname>.wasm'
   * where dirname is the name of the current working directory.
   */
  output?: string;
  /**
   * Enable JavaScript debugging support.
   */
  debug?: boolean;
  /**
   * Enable Ahead of Time compilation.
   */
  aot?: boolean;
  /**
   * URL used for the "Location" builtin during top level initialization.
   */
  initLocation?: string;
}

/**
 * Programmatic API for componentizing a JS bundle into a Wasm component.
 * This performs the same steps as the `j2w` CLI tool:
 * 1. Scans WIT dependencies from node_modules
 * 2. Merges WIT worlds
 * 3. Precompiles the source (regex optimization)
 * 4. Chains source maps
 * 5. Calls componentize-js to produce the .wasm component
 * 6. Saves build metadata for incremental builds
 */
export async function componentize(options: ComponentizeOptions = {}) {
  const {
    input = './build/bundle.js',
    output,
    debug = false,
    aot = false,
    initLocation,
  } = options;

  const src = input;
  const outputPath = output || `./dist/${path.basename(process.cwd())}.wasm`;

  // Ensure output directory exists
  mkdirSync(path.dirname(outputPath), { recursive: true });

  let runtimeArgs: string[] = [];
  let features = new Set<string>();
  if (debug) runtimeArgs.push('--enable-script-debugging');
  if (initLocation) runtimeArgs.push(`--init-location ${initLocation}`);
  if (aot) features.add('aot');

  // Generate wit world string
  let wasiDeps = getPackagesWithWasiDeps(process.cwd(), new Set(), true);
  let { witPaths, targetWorlds } = processWasiDeps(wasiDeps);

  // Debugging requires some interfaces around reading env vars and making
  // socket connections to be available.
  if (debug) {
    let httpTrigger = targetWorlds.find(
      (world) => world.packageName === 'spinframework:http-trigger@0.2.10',
    );
    if (!httpTrigger) {
      throw new Error(
        'Debugging requires the @spinframework/http-trigger package to be included in the target worlds.',
      );
    }
    targetWorlds.push({
      packageName: 'spinframework:http-trigger@0.2.10',
      worldName: 'debugging-support',
    });
  }

  // Handle spin-dependencies.wit which will be present if component has dependencies defined in spin.toml
  let spinComponentDeps = getSpinComponentDependencies();
  if (spinComponentDeps) {
    witPaths.push(spinComponentDeps.witPath);
    targetWorlds.push({
      packageName: spinComponentDeps.packageName,
      worldName: spinComponentDeps.worldName,
    });
  }

  // Get inline wit by merging the wits specified by all the dependencies
  let inlineWit = mergeWit(
    witPaths,
    targetWorlds,
    'combined',
    'combined-wit:combined-wit@0.3.0',
  );

  let inlineWitChecksum = await calculateChecksum(inlineWit);
  // Small optimization to skip componentization if the source file hasn't changed
  if (!(await ShouldComponentize(src, outputPath, componentizeVersion, runtimeArgs.join(" "), inlineWitChecksum, features))) {
    console.log(
      'No changes detected in source file and target World. Skipping componentization.',
    );
    return;
  }
  console.log('Componentizing...');

  const source = await readFile(src, 'utf8');
  let { content: precompiledSource, sourceMap: precompiledSourceMap } = precompile(source, src, true, 'precompiled-source.js') as { content: string; sourceMap: SourceMapInput | null };
  // Resolve the final source map by combining precompiled and input source maps as needed
  let inputSourceMap = await getSourceMapFromFile(src);
  let finalSourceMap: SourceMapInput | null = null;
  if (precompiledSourceMap && inputSourceMap) {
    finalSourceMap = chainSourceMaps(precompiledSourceMap, { [src]: inputSourceMap }) as SourceMapInput;
  } else if (inputSourceMap) {
    finalSourceMap = inputSourceMap;
  } else if (precompiledSourceMap) {
    finalSourceMap = precompiledSourceMap;
  }

  // Write precompiled source to disk for debugging purposes.
  let srcDir = path.dirname(src);
  let precompiledSourcePath = path.join(srcDir, 'precompiled-source.js');
  await writeFile(precompiledSourcePath, precompiledSource);
  if (finalSourceMap) {
    await writeFile(precompiledSourcePath + '.map', JSON.stringify(finalSourceMap, null, 2));
  }

  const { component } = await componentizeJs({
    sourcePath: precompiledSourcePath,
    // @ts-ignore
    witWorld: inlineWit,
    runtimeArgs: runtimeArgs.join(" "),
    enableAot: aot,
  });

  await writeFile(outputPath, component);

  // Save the checksum of the input file along with the componentize version
  await saveBuildData(
    getBuildDataPath(src),
    await calculateChecksum(await readFile(src)),
    componentizeVersion,
    runtimeArgs.join(" "),
    inlineWitChecksum,
    features
  );

  console.log('Component successfully written.');
}
