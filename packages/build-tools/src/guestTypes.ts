import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
// `types` is the programmatic API for jco's type generation (exported as `typesComponent`)
import { types as typesComponent } from '@bytecodealliance/jco';

const DEFAULT_GUEST_TYPES_OUTPUT_DIR = './types/generated/wit/guest';

/**
 * Generate TypeScript type declarations for a WIT file's guest bindings.
 */
export async function generateGuestTypes(witPath: string, worldName: string, outDir?: string) {
  const resolvedOutDir = outDir || DEFAULT_GUEST_TYPES_OUTPUT_DIR;


  const files: Record<string, Uint8Array> = await typesComponent(witPath, {
    worldName,
    outDir: path.resolve(resolvedOutDir),
    guest: true,
  });

  // Write all generated files
  await Promise.all(
    Object.entries(files).map(async ([filePath, contents]) => {
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, contents);
    }),
  );
}
