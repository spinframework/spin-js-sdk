import { getPackagesWithWasiDeps } from "../../dist/wasiDepsParser.js";
class SpinSdkPlugin {
    constructor() {
        this.externals = {};
    }

    static async init() {
        const { getWitImports } = await import("../../lib/wit_tools.js");
        let plugin = new SpinSdkPlugin();

        let wasiDeps = getPackagesWithWasiDeps(process.cwd());
        let witPaths = [];
        let targetWorlds = []
        let wellKnownWorlds = []
        wasiDeps.map((dep) => {
            if (dep.config?.wasiDep?.witDeps) {
                witPaths.push(dep.config.wasiDep.witDeps.witPath)
                targetWorlds.push({ packageName: dep.config.wasiDep.witDeps.package, worldName: dep.config.wasiDep.witDeps.world })
            }
            if (dep.config?.wasiDep?.wellKnownWorlds) {
                wellKnownWorlds.push(...dep.config.wasiDep.wellKnownWorlds)
            }
        })

        let wellKnwonDirectories = []
        // If there any well known wits, add them to the witPaths and targetWorlds
        for (let wellKnownWorld of wellKnownWorlds) {
            let tempdir = fs.mkdtempSync("well-known-wits");
            wellKnwonDirectories.push(tempdir);

            let targetWorld = setupWellKnownWits(wellKnownWorld, tempdir);
            witPaths.push(tempdir);
            targetWorlds.push(targetWorld)
        }


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

        console.log(compiler.options.externals)

    }
}


export default SpinSdkPlugin;
