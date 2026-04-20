#!/usr/bin/env node

import { componentize } from '@bytecodealliance/componentize-js';
import { version as componentizeVersion } from '@bytecodealliance/componentize-js';
import { getPackagesWithWasiDeps, processWasiDeps } from './wasiDepsParser.js';
import {
  calculateChecksum,
  chainSourceMaps,
  fileExists,
  getSourceMapFromFile,
  saveBuildData,
} from './utils.js';
import { getCliArgs } from './cli.js';
import { getBuildDataPath, ShouldComponentize } from './build.js';
import { readFile, writeFile } from 'node:fs/promises';
import { mergeWit } from '../lib/wit_tools.js';
//@ts-ignore
import { precompile } from "./precompile.js"
import path from 'node:path'
import { SourceMapInput } from '@ampproject/remapping';

async function main() {
  try {
    // Parse CLI args
    let CliArgs = getCliArgs();
    let src = CliArgs.input;
    let outputPath = CliArgs.output;
    let runtimeArgs = []
    let features = new Set<string>();
    CliArgs.debug && runtimeArgs.push('--enable-script-debugging');
    CliArgs.initLocation && runtimeArgs.push(`--init-location ${CliArgs.initLocation}`);

    if (CliArgs.aot) {
      features.add('aot');
    }

    // generate wit world string
    let wasiDeps = getPackagesWithWasiDeps(process.cwd(), new Set(), true);
    let { witPaths, targetWorlds } = processWasiDeps(wasiDeps);

    // Debugging requires some interfaces around reading env vars and making
    // socket connections to be available.
    if (CliArgs.debug) {
      // check if @spinframework/http-trigger is already in the targetWorlds
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

    // Get inline wit by merging the wits specified by all the dependencies
    let inlineWit = mergeWit(
      witPaths,
      targetWorlds,
      'combined',
      // Hardcode the version to atleast 0.3.0 to deal with wasm-tools bug with "include" slurping original package when `@since` is present
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
      // Precompiled source map is empty (no relevant transformations) — use the input source map directly
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

    const { component } = await componentize({
      sourcePath: precompiledSourcePath,
      // @ts-ignore
      witWorld: inlineWit,
      runtimeArgs: runtimeArgs.join(" "),
      enableAot: CliArgs.aot,
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
  } catch (error) {
    console.error(
      'An error occurred during the componentization process:',
      error,
    );
    console.error('Error:', error);
  }
}

main();
