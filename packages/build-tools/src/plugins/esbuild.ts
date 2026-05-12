import { getPackagesWithWasiDeps, processWasiDeps } from '../wasiDepsParser.js';
import { getSpinComponentDependencies } from '../spinComponentDeps.js';
import { componentize, type ComponentizeOptions } from '../componentize.js';
import { generateGuestTypes } from '../guestTypes.js';
import fs from 'node:fs';

export interface SpinEsbuildPluginOptions {
  componentize?: boolean | ComponentizeOptions;
}

/**
 * SpinEsbuildPlugin - esbuild plugin for building Spin components.
 *
 * Without options (backward compatible):
 *   await SpinEsbuildPlugin()
 *   // Only marks WIT imports as external and suppresses vendor source map warnings
 *
 * With componentize option (full pipeline):
 *   await SpinEsbuildPlugin({ componentize: true })
 *   await SpinEsbuildPlugin({ componentize: { debug: true, initLocation: '...' } })
 *   // Generates TypeScript types for component dependencies (if spin-dependencies.wit exists)
 *   // Marks WIT imports as external
 *   // Suppresses vendor source map warnings
 *   // Componentizes the bundle into a .wasm file after build
 */
export async function SpinEsbuildPlugin(options: SpinEsbuildPluginOptions = {}) {
  const { getWitImports } = await import('../../lib/wit_tools.js');

  // Get WIT imports from dependencies
  const wasiDeps = getPackagesWithWasiDeps(process.cwd(), new Set(), true);
  const { witPaths, targetWorlds } = processWasiDeps(wasiDeps);

  let witImports: string[] = [];
  if (witPaths.length > 0 && targetWorlds.length > 0) {
    witImports = getWitImports(witPaths, targetWorlds);
  }

  // Check for Spin component dependencies and add them to the list of WIT imports if present
  const spinComponentDeps = getSpinComponentDependencies();
  if (spinComponentDeps) {
    const { witPath, packageName, worldName } = spinComponentDeps;
    witImports.push(...getWitImports([witPath], [{ packageName, worldName }]));

    // Generate TypeScript types for component dependencies
    await generateGuestTypes(witPath, worldName);
    console.log(`Generated guest types for Spin component dependencies`);
  }

  // Store as a Set for fast lookup
  const externals = new Set(witImports);

  const shouldComponentize = !!options.componentize;
  const componentizeOpts: ComponentizeOptions = typeof options.componentize === 'object' ? options.componentize : {};

  return {
    name: 'spin-sdk',
    setup(build: any) {
      // Mark WIT imports as external
      build.onResolve({ filter: /.*/ }, (args: any) => {
        if (externals.has(args.path)) {
          return { path: args.path, external: true };
        }
        return null;
      });

      // Suppress vendor source map warnings from node_modules
      build.onLoad({ filter: /node_modules\/.*\.(?:[cm]?js|tsx?)$/ }, (args: any) => {
        return {
          contents: fs.readFileSync(args.path, 'utf8')
            + '\n//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIiJdLCJtYXBwaW5ncyI6IkEifQ==',
          loader: 'default',
        };
      });

      if (shouldComponentize) {
        // After bundle is written, run componentization
        build.onEnd(async (result: any) => {
          if (result.errors.length > 0) {
            console.error(`[spin-sdk] Build failed, skipping componentization`);
            return;
          }

          const outfile = build.initialOptions.outfile || './build/bundle.js';

          await componentize({
            input: outfile,
            output: componentizeOpts.output,
            debug: componentizeOpts.debug || false,
            aot: componentizeOpts.aot || false,
            initLocation: componentizeOpts.initLocation,
          });
        });
      }
    }
  };
}
