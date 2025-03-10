import {
  calculateChecksum,
  fileExists,
  getExistingBuildData,
} from './utils.js';

export function getBuildDataPath(src: string): string {
  return `${src}.buildData.json`;
}

export async function ShouldComponentize(
  src: string,
  outputPath: string,
  componentizeVersion: string,
) {
  const sourceChecksum = await calculateChecksum(src);
  const existingBuildData = await getExistingBuildData(getBuildDataPath(src));

  if (
    existingBuildData?.version == componentizeVersion &&
    existingBuildData?.checksum === sourceChecksum &&
    (await fileExists(outputPath))
  ) {
    return false;
  }

  return true;
}
