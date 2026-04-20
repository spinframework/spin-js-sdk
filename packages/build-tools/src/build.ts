import { readFile } from 'node:fs/promises';
import {
  areEqualSets,
  calculateChecksum,
  fileExists,
  getExistingBuildData,
} from './utils.js';

export function getBuildDataPath(src: string): string {
  return `${src}.buildData.json`;
}

export async function ShouldComponentize(
  src: string, outputPath: string, componentizeVersion: string, runtimeArgs: string, targetWitChecksum: string, features: Set<string>
) {
  const sourceChecksum = await calculateChecksum(await readFile(src));
  const existingBuildData = await getExistingBuildData(getBuildDataPath(src));
  

  if (
    existingBuildData?.version == componentizeVersion &&
    existingBuildData?.checksum === sourceChecksum &&
    existingBuildData?.runtimeArgs === runtimeArgs &&
    existingBuildData?.targetWitChecksum === targetWitChecksum &&
    areEqualSets(new Set(existingBuildData?.features || []), features) &&
    (await fileExists(outputPath))
  ) {
    return false;
  }

  return true;
}
