#!/usr/bin/env node

import { componentize } from './componentize.js';
import { getCliArgs } from './cli.js';

async function main() {
  try {
    const CliArgs = getCliArgs();
    await componentize({
      input: CliArgs.input,
      output: CliArgs.output,
      debug: CliArgs.debug,
      aot: CliArgs.aot,
      initLocation: CliArgs.initLocation,
    });
  } catch (error) {
    console.error(
      'An error occurred during the componentization process:',
      error,
    );
    process.exit(1);
  }
}

main();
