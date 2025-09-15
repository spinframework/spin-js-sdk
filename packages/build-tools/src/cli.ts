import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export interface CliArgs {
  input: string;
  output: string;
  aot?: boolean;
  debug?: boolean;
}

export function getCliArgs(): CliArgs {
  let args = yargs(hideBin(process.argv))
    .option('input', {
      alias: 'i',
      describe: 'Path to the input file',
      demandOption: true,
    })
    .option('output', {
      alias: 'o',
      describe: 'Path to the output file',
      default: 'component.wasm',
    })
    .option('aot', {
      describe: 'Enable Ahead of Time compilation',
      type: 'boolean',
      hidden: true,
    })
    .option('debug', {
      alias: 'd',
      describe: 'Enable JavaScript debugging',
      type: 'boolean',
    })
    .argv as CliArgs;

  return args;
}
