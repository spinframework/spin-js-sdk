import { fileURLToPath } from 'url';
import path from 'path';
import { resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WELL_KNWON_WITS: Record<string, { path: string; package: string; world: string }> = {
    "http-trigger@0.2.3": {
        path: "../well-known-wits/wasi-http@0.2.3.wit",
        package: "spinframework:http-trigger@0.1.0",
        world: "http-trigger"
    }
}

export async function setupWellKnownWits(wellKnownWorld: string) {
    if (WELL_KNWON_WITS[wellKnownWorld]) {
        return {
            withPath: resolve(__dirname, WELL_KNWON_WITS[wellKnownWorld].path),
            targetWorld: {
                packageName: WELL_KNWON_WITS[wellKnownWorld].package,
                worldName: WELL_KNWON_WITS[wellKnownWorld].world
            }
        }
    } else {
        throw new Error(`Well known wit ${wellKnownWorld} not found`)
    }
}