import { readFile } from 'fs/promises';
import { createHash } from 'node:crypto';
import { access, writeFile } from 'node:fs/promises';


// Function to calculate file checksum
export async function calculateFileChecksum(filePath: string) {
  try {
    const fileBuffer = await readFile(filePath);
    const hash = createHash('sha256');
    hash.update(fileBuffer);
    return hash.digest('hex');
  } catch (error) {
    console.error(`Error calculating checksum for file ${filePath}:`, error);
    throw error;
  }
}

export function calculateCheckSum(data: string | Buffer): string {
  const hash = createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
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
