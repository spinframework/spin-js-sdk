import type { NitroPreset  } from 'nitropack'
import { fileURLToPath } from 'node:url'

export default <NitroPreset>{
    extends: 'base-worker',
    entry: fileURLToPath(new URL('./spin.ts', import.meta.url)),
    exportConditions: ['workerd'],
    minify: false,
    rollupConfig: {
        output: {
            format: 'esm',
        }
    }
};
