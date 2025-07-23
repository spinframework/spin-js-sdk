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
import { get } from 'node:http';

async function main() {
  try {
    // Parse CLI args
    let CliArgs = getCliArgs();
    let src = CliArgs.input;
    let outputPath = CliArgs.output;
    let runtimeArgs = CliArgs.debug ? '--enable-script-debugging' : '';

    // generate wit world string
    let wasiDeps = getPackagesWithWasiDeps(process.cwd(), new Set(), true);
    let { witPaths, targetWorlds } = processWasiDeps(wasiDeps);

    // Debugging requires some interfaces around reading env vars and making
    // socket connections to be available.
    if (CliArgs.debug) {
      // check if @spinframework/http-trigger is already in the targetWorlds
      let httpTrigger = targetWorlds.find(
        (world) => world.packageName === 'spinframework:http-trigger@0.2.3',
      );
      if (!httpTrigger) {
        throw new Error(
          'Debugging requires the @spinframework/http-trigger package to be included in the target worlds.',
        );
      }
      targetWorlds.push({
        packageName: 'spinframework:http-trigger@0.2.3',
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
    if (!(await ShouldComponentize(src, outputPath, componentizeVersion, runtimeArgs, inlineWitChecksum))) {
      console.log(
        'No changes detected in source file and target World. Skipping componentization.',
      );
      return;
    }
    console.log('Componentizing...');

    const source = await readFile(src, 'utf8');
    let { content: precompiledSource, sourceMap: precompiledSourceMap } = precompile(source, src, true, 'precompiled-source.js') as { content: string; sourceMap: SourceMapInput };
    // Check if input file has a source map because if we does, we need to chain it with the precompiled source map
    let inputSourceMap = await getSourceMapFromFile(src);
    if (inputSourceMap) {
      precompiledSourceMap = chainSourceMaps(precompiledSourceMap, { [src]: inputSourceMap }) as SourceMapInput;
    }

    // Write precompiled source to disk for debugging purposes.
    let srcDir = path.dirname(src);
    let precompiledSourcePath = path.join(srcDir, 'precompiled-source.js');
    await writeFile(precompiledSourcePath, precompiledSource);
    if (precompiledSourceMap) {
      await writeFile(precompiledSourcePath + '.map', JSON.stringify(precompiledSourceMap, null, 2));
    }

    const { component } = await componentize({
      sourcePath: precompiledSourcePath,
      // @ts-ignore
      witWorld: inlineWit,
      runtimeArgs,
      enableAot: CliArgs.aot,
    });

    await writeFile(outputPath, component);

    // Save the checksum of the input file along with the componentize version
    await saveBuildData(
      getBuildDataPath(src),
      await calculateChecksum(await readFile(src)),
      componentizeVersion,
      runtimeArgs,
      inlineWitChecksum,
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
