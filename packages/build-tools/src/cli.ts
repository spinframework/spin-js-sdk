import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Defining the shape of the arguments using TypeScript
export interface CliArgs {
    input: string;
    output: string;
    triggerType: string;
    witPath?: string;
    aot?: boolean;
}

export function getCliArgs(): CliArgs {
    let args = yargs(hideBin(process.argv))
        .option('input', {
            alias: 'i',
            describe: 'Path to the input file',
            demandOption: true
        })
        .option('wit-path', {
            alias: 'd',
            describe: 'Path to wit file or folder',
        })
        .option('output', {
            alias: 'o',
            describe: 'Path to the output file',
            default: 'component.wasm'
        })
        .option('trigger-type', {
            alias: '-n',
            describe: "Spin trigger to target",
            demandOption: true
        })
        .option('aot', {
            describe: "Enable Ahead of Time compilation",
            type: 'boolean',
        })
        .argv as CliArgs;

    return args;
}