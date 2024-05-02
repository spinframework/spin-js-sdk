#!/usr/bin/env node

import { componentize } from "@bytecodealliance/componentize-js";
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const validSpinWorlds = ['spin-http'];


const args = yargs(hideBin(process.argv))
    .option('input', {
        alias: 'i',
        describe: 'Path to the input file',
        demandOption: true
    })
    .option('wit-path', {
        alias: 'd',
        describe: 'Path to wit file or folder',
        demandOption: true
    })
    .option('output', {
        alias: 'o',
        describe: 'Path to the output file',
        default: 'component.wasm'
    })
    .option('trigger-type', {
        alias: '-n',
        describe: "Spin trigger to target",
        choices: validSpinWorlds,
        demandOption: true
    })
    .argv;

const src = args.input;
const source = await readFile(src, 'utf8');
const { component } = await componentize(source, {
    sourceName: basename(src),
    witPath: resolve(args.witPath),
    worldName: args.triggerType,
    disableFeatures: [],
});

await writeFile(args.output, component);
console.log("Successfully written component");