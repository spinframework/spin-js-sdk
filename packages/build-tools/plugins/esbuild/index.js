import {
    getPackagesWithWasiDeps,
    processWasiDeps
} from '../../dist/wasiDepsParser.js';
import { getSpinComponentDependencies } from '../../dist/spinComponentDeps.js';

export async function SpinEsbuildPlugin() {
    const { getWitImports } = await import('../../lib/wit_tools.js');

    // Step 1: Get WIT imports from dependencies
    const wasiDeps = getPackagesWithWasiDeps(process.cwd(), new Set(), true);
    const { witPaths, targetWorlds } = processWasiDeps(wasiDeps);
    const witImports = getWitImports(witPaths, targetWorlds);

    // Check for Spin componentd dependencies and add them to the list of WIT imports if present
    const spinComponentDeps = getSpinComponentDependencies();
    if (spinComponentDeps) {
        const { witPath, packageName, worldName } = spinComponentDeps;
        witImports.push(...getWitImports([witPath], [{ packageName, worldName }]));
    }

    // Store as a Set for fast lookup
    const externals = new Set(witImports);

    return {
        name: 'spin-sdk-externals',
        setup(build) {
            build.onResolve({ filter: /.*/ }, args => {
                if (externals.has(args.path)) {
                    return { path: args.path, external: true };
                }
                return null;
            });
        }
    };
}