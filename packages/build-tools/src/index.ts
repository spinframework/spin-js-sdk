#!/usr/bin/env node

import { componentize } from '@bytecodealliance/componentize-js';
import { version as componentizeVersion } from '@bytecodealliance/componentize-js';
import { getPackagesWithWasiDeps, processWasiDeps } from './wasiDepsParser.js';
import { basename } from 'node:path';

import {
  calculateChecksum,
  getPackageVersion,
  saveBuildData,
} from './utils.js';
import { getCliArgs } from './cli.js';
import { getBuildDataPath, ShouldComponentize } from './build.js';
import { readFile, writeFile } from 'node:fs/promises';
import { mergeWit } from '../lib/wit_tools.js';

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
      'combined-wit:combined-wit@0.1.0',
    );

    const { component } = await componentize({
      sourcePath: src,
      // @ts-ignore
      witWorld: inlineWit,
      runtimeArgs,
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
