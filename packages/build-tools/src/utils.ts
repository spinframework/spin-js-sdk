import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import { createHash } from 'node:crypto';
import { access, writeFile } from 'node:fs/promises';

export const getPackageVersion = async (packageName: string) => {
  try {
    const resolvedPath = await import.meta.resolve(`${packageName}`);

    let packageJsonPath = resolvedPath;
    let parentDir = path.dirname(fileURLToPath(new URL(packageJsonPath)));

    // Walk up the directory structure to find package.json
    while (parentDir !== path.dirname(parentDir)) {
      const potentialPackageJsonPath = path.join(parentDir, 'package.json');
      try {
        // Try reading the package.json file in this directory
        const packageJsonContents = await readFile(
          potentialPackageJsonPath,
          'utf-8',
        );
        const packageJson = JSON.parse(packageJsonContents);

        return packageJson.version;
      } catch (error) {
        parentDir = path.dirname(parentDir);
      }
    }

    console.error(`Error: Could not find package.json for '${packageName}'`);
    return null;
  } catch (error) {
    console.error(`Error: Could not find package '${packageName}'`, error);
    return null;
  }
};

// Function to calculate file checksum
export async function calculateChecksum(filePath: string) {
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
  buildDataPath: string,
  checksum: string,
  version: string,
) {
  try {
    const checksumData = {
      version,
      checksum,
    };
    await writeFile(buildDataPath, JSON.stringify(checksumData, null, 2));
  } catch (error) {
    console.error(`Error saving checksum file at ${buildDataPath}:`, error);
    throw error;
  }
}
