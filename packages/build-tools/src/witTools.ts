/// <reference lib="dom" />

import {
  environment,
  exit,
  stderr,
  stdin,
  stdout,
  terminalInput,
  terminalOutput,
  terminalStderr,
  terminalStdin,
  terminalStdout,
} from '@bytecodealliance/preview2-shim/cli';
import { createFilesystem } from '@bytecodealliance/preview2-shim/filesystem';
import { error, streams } from '@bytecodealliance/preview2-shim/io';
import { random } from '@bytecodealliance/preview2-shim/random';
import { readFileSync, statSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { instantiate } from '../lib/wit_tools.js';
import type { ImportObject, Root, TargetWorld } from '../lib/wit_tools.js';

const createNodeFilesystem = createFilesystem as unknown as (config: {
  preopens: Record<string, string>;
}) => ReturnType<typeof createFilesystem>;
const generatedWitToolsUrl = new URL('../lib/', import.meta.url);

function instantiateWitTools(witPaths: string[]): {
  tools: Root;
  guestWitPaths: string[];
} {
  const preopens: Record<string, string> = {};
  const guestWitPaths: string[] = [];

  for (const [index, witPath] of witPaths.entries()) {
    const resolvedPath = resolve(witPath);
    const isDirectory = statSync(resolvedPath).isDirectory();
    const directory = isDirectory ? resolvedPath : dirname(resolvedPath);
    const guestDirectory = `/wit/${index}`;

    preopens[guestDirectory] = directory;
    guestWitPaths.push(
      isDirectory ? guestDirectory : `${guestDirectory}/${basename(resolvedPath)}`,
    );
  }

  const filesystem = createNodeFilesystem({ preopens });
  const imports = {
    'wasi:cli/environment': environment,
    'wasi:cli/exit': exit,
    'wasi:cli/stderr': stderr,
    'wasi:cli/stdin': stdin,
    'wasi:cli/stdout': stdout,
    'wasi:cli/terminal-input': terminalInput,
    'wasi:cli/terminal-output': terminalOutput,
    'wasi:cli/terminal-stderr': terminalStderr,
    'wasi:cli/terminal-stdin': terminalStdin,
    'wasi:cli/terminal-stdout': terminalStdout,
    'wasi:filesystem/preopens': filesystem.preopens,
    'wasi:filesystem/types': filesystem.types,
    'wasi:io/error': error,
    'wasi:io/streams': streams,
    'wasi:random/random': random,
  };

  // JCO's custom-instantiation runtime expects unversioned WASI import keys,
  // but its generated TypeScript declaration types them with versions.
  return {
    tools: instantiate(
      path => new WebAssembly.Module(readFileSync(new URL(path, generatedWitToolsUrl))),
      imports as unknown as ImportObject,
    ),
    guestWitPaths,
  };
}

export function getWitImports(witPaths: string[], worlds: TargetWorld[]): string[] {
  const { tools, guestWitPaths } = instantiateWitTools(witPaths);
  return tools.getWitImports(guestWitPaths, worlds);
}

export function mergeWit(
  witPaths: string[],
  worlds: TargetWorld[],
  outputWorld?: string,
  outputPackage?: string,
): string {
  const { tools, guestWitPaths } = instantiateWitTools(witPaths);
  return tools.mergeWit(
    guestWitPaths,
    worlds,
    outputWorld,
    outputPackage,
  );
}

export type { TargetWorld };
