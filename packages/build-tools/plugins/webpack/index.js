import { getPackagesWithWasiDeps, processWasiDeps, processWellKnownWorlds } from "../../dist/wasiDepsParser.js";
class SpinSdkPlugin {
    constructor() {
        this.externals = {};
    }

    static async init() {
        const { getWitImports } = await import("../../lib/wit_tools.js");
        let plugin = new SpinSdkPlugin();

        let wasiDeps = getPackagesWithWasiDeps(process.cwd(), new Set(), true);
        let { witPaths, targetWorlds, wellKnownWorlds } = processWasiDeps(wasiDeps)
        let { witPaths: wellKnownWitPaths, targetWorlds: wellKnownTargetWorlds } = await processWellKnownWorlds(wellKnownWorlds);
        wellKnownWitPaths.forEach((path) => {
            witPaths.push(path)
        })
        wellKnownTargetWorlds.forEach((target) => {
            targetWorlds.push(target)
        })

        let imports = getWitImports(witPaths, targetWorlds);

        imports.map((i) => {
            plugin.externals[i] = i;
        });

        return plugin;
    }

    apply(compiler) {
        if (compiler.options.externals && typeof compiler.options.externals === 'object') {
            this.externals = Object.assign({}, compiler.options.externals, this.externals);
        }
        compiler.options.externals = this.externals;
    }
}


export default SpinSdkPlugin;
