#!/usr/bin/env node

import { componentize } from "@bytecodealliance/componentize-js";
import { readFile, writeFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, basename } from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';

const __filename = new URL(import.meta.url).pathname;
const __dirname = __filename.substring(0, __filename.lastIndexOf('/'));

const args = yargs(hideBin(process.argv))
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
    .argv;

const src = args.input;
const outputPath = args.output;
const inputChecksumPath = `${src}.checksum`;

// Function to calculate file checksum
async function calculateChecksum(filePath) {
    const fileBuffer = await readFile(filePath);
    const hash = createHash('sha256');
    hash.update(fileBuffer);
    return hash.digest('hex');
}

// Function to check if a file exists
async function fileExists(filePath) {
    try {
        await access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function getExistingChecksum(checksumPath) {
    if (await fileExists(checksumPath)) {
        return await readFile(checksumPath, 'utf8');
    }
    return null;
}

async function saveChecksum(checksumPath, checksum) {
    await writeFile(checksumPath, checksum);
}

(async () => {
    const sourceChecksum = await calculateChecksum(src);
    const existingChecksum = await getExistingChecksum(inputChecksumPath);

    if ((existingChecksum === sourceChecksum) && fileExists(outputPath)) {
        console.log("No changes detected in source file. Skipping componentization.");
        return;
    }

    const source = await readFile(src, 'utf8');

    // Check if a non-default wit directory is supplied
    const witPath = args.witPath ? resolve(args.witPath) : path.join(__dirname, 'wit');
    if (args.witPath) {
        console.log(`Using user-provided wit in: ${witPath}`);
    }

    const { component } = await componentize(source, {
        sourceName: basename(src),
        witPath,
        worldName: args.triggerType,
        disableFeatures: [],
        enableFeatures: ["http"],
        enableAot: args.aot
    });

    await writeFile(outputPath, component);

    // Save the checksum of the input file
    await saveChecksum(inputChecksumPath, sourceChecksum);

    console.log("Component successfully written.");
})();
