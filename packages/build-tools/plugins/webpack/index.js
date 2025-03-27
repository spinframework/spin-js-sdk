import {
  getPackagesWithWasiDeps,
  processWasiDeps,
} from '../../dist/wasiDepsParser.js';

// The plugin is used to automatically add the wit imports to the webpack
// externals. This is required because the bindings for wit imports are not
// generated until we are componentizing and webpack needs to consider them
// externals (available at runtime).
class SpinSdkPlugin {
  constructor() {
    this.externals = {};
  }

  static async init() {
    const { getWitImports } = await import('../../lib/wit_tools.js');
    let plugin = new SpinSdkPlugin();

    // Get the list of wit dependencies from other packages as defined in the package.json.
    let wasiDeps = getPackagesWithWasiDeps(process.cwd(), new Set(), true);
    let { witPaths, targetWorlds } = processWasiDeps(wasiDeps);

    // Get the list of wit imports from the world
    let imports = getWitImports(witPaths, targetWorlds);

    // Convert the imports into a format that can be used to define the webpack
    // externals that can be applied.
    imports.map(i => {
      plugin.externals[i] = i;
    });

    return plugin;
  }

  apply(compiler) {
    if (
      compiler.options.externals &&
      typeof compiler.options.externals === 'object'
    ) {
      this.externals = Object.assign(
        {},
        compiler.options.externals,
        this.externals,
      );
    }
    compiler.options.externals = this.externals;
  }
}

export default SpinSdkPlugin;
