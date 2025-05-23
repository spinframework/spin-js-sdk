#!/usr/bin/env node

import { componentize } from '@bytecodealliance/componentize-js';
import { version as componentizeVersion } from '@bytecodealliance/componentize-js';
import { getPackagesWithWasiDeps, processWasiDeps } from './wasiDepsParser.js';
import {
  calculateChecksum,
  saveBuildData,
} from './utils.js';
import { getCliArgs } from './cli.js';
import { getBuildDataPath, ShouldComponentize } from './build.js';
import { readFile, writeFile } from 'node:fs/promises';
import { mergeWit } from '../lib/wit_tools.js';
//@ts-ignore
import { precompile } from "./precompile.js"
import path from 'node:path'

async function main() {
  try {
    // Parse CLI args
    let CliArgs = getCliArgs();
    let src = CliArgs.input;
    let outputPath = CliArgs.output;
    let runtimeArgs = CliArgs.debug ? '--enable-script-debugging' : '';

    // Small optimization to skip componentization if the source file hasn't changed
    if (!(await ShouldComponentize(src, outputPath, componentizeVersion, runtimeArgs))) {
      console.log(
        'No changes detected in source file. Skipping componentization.',
      );
      return;
    }
    console.log('Componentizing...');

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

    const source = await readFile(src, 'utf8');
    const precompiledSource = precompile(source, src, true) as string;

    // Write precompiled source to disk for debugging purposes In the future we
    // will also write a source map to make debugging easier
    let srcDir = path.dirname(src);
    let precompiledSourcePath = path.join(srcDir, 'precompiled-source.js');
    await writeFile(precompiledSourcePath, precompiledSource);

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
      await calculateChecksum(src),
      componentizeVersion,
      runtimeArgs,
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
