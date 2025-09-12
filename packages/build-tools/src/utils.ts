import { readFile } from 'fs/promises';
import { createHash } from 'node:crypto';
import { access, writeFile } from 'node:fs/promises';
import remapping from '@ampproject/remapping';
import type { SourceMapInput } from '@ampproject/remapping';
import path from 'path';

type FileName = string;
type SourceMapLookup = Record<FileName, SourceMapInput>;

export function chainSourceMaps(finalMap: SourceMapInput, sourceMapLookup: SourceMapLookup) {
  // @ts-ignore
  return remapping(finalMap, (source: FileName) => {
    const sourceMap = sourceMapLookup[source];
    if (sourceMap) {
      return sourceMap;
    }
    // If not the source, we do not want to traverse it further so we return null.
    // This is because sometimes npm packages have their own source maps but do
    // not have the original source files.
    return null;
  });
}

export async function calculateChecksum(content: string | Buffer) {
  try {
    const hash = createHash('sha256');
    hash.update(content);
    return hash.digest('hex');
  } catch (error) {
    console.error(`Error calculating checksum:`, error);
    throw error;
  }
}


// Function to check if a file exists
export async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function getExistingBuildData(buildDataPath: string) {
  try {
    if (await fileExists(buildDataPath)) {
      const buildData = await readFile(buildDataPath, 'utf8');
      return JSON.parse(buildData);
    }
    return null;
  } catch (error) {
    console.error(
      `Error reading existing checksum file at ${buildDataPath}:`,
      error,
    );
    throw error;
  }
}

export async function saveBuildData(
  buildDataPath: string, checksum: string, version: string, runtimeArgs: string, targetWitChecksum: string
) {
  try {
    const checksumData = {
      version,
      checksum,
      runtimeArgs,
      targetWitChecksum,
    };
    await writeFile(buildDataPath, JSON.stringify(checksumData, null, 2));
  } catch (error) {
    console.error(`Error saving checksum file at ${buildDataPath}:`, error);
    throw error;
  }
}

export async function getSourceMapFromFile(filePath: string): Promise<SourceMapInput | null> {
  try {
    const content = await readFile(filePath, 'utf8');

    // Look for the sourceMappingURL comment
    const sourceMapRegex = /\/\/[#@]\s*sourceMappingURL=(.+)$/m;
    const match = content.match(sourceMapRegex);

    if (!match) return null;

    const sourceMapUrl = match[1].trim();

    if (sourceMapUrl.startsWith('data:application/json;base64,')) {
      // Inline base64-encoded source map
      const base64 = sourceMapUrl.slice('data:application/json;base64,'.length);
      const rawMap = Buffer.from(base64, 'base64').toString('utf8');
      return JSON.parse(rawMap);
    } else {
      // External .map file
      const mapPath = path.resolve(path.dirname(filePath), sourceMapUrl);
      try {
        const rawMap = await readFile(mapPath, 'utf8');
        return JSON.parse(rawMap);
      } catch (e) {
        return null; // map file not found or invalid
      }
    }
  } catch (err) {
    return null; // file doesn't exist or can't be read
  }
}
