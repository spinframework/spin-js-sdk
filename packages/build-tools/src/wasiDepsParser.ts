import fs from "fs";
import { TargetWorld } from "../lib/wit_tools.js";
import path from "path";
import { setupWellKnownWits } from "./wellKnownWits.js"


// Define the structure of a package.json file
// Includes dependencies and an optional config section for 'knitwit'
type PackageJson = {
    name: string,
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
    config?: {
        wasiDep?: {
            witDeps?: witDep[];
            wellKnownWorlds?: string[];
        };
    };
};

type witDep = {
    witPath: string;
    package: string;
    world: string;
}

// Define the result structure containing package name and config
type DependencyResult = {
    name: string;
    config: {
        wasiDep: {
            witDeps?: witDep[];
            wellKnownWorlds?: string[];
        }
    };
}[];

// Reads and parses a package.json file
export function readPackageJson(packageJsonPath: string): PackageJson | null {
    if (!fs.existsSync(packageJsonPath)) return null;
    return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
}

// Resolves the absolute path of a dependency, checking both node_modules
export function resolveDependencyPath(
    dir: string,
    dep: string,
    dependencies: Record<string, string>,
): string {
    let depPath = path.join(dir, "node_modules", dep);
    if (!fs.existsSync(depPath)) {
        depPath = path.resolve(dir, dependencies[dep]);
    }
    return depPath;
}

// Converts the 'witPath' inside the config section to an absolute path if it is relative
function absolutizeWitPath(depPackageJsonPath: string, depPackageJson: PackageJson): void {
    if (depPackageJson.config?.wasiDep?.witDeps) {
        depPackageJson.config.wasiDep.witDeps.forEach((witDep) => {
            if (!path.isAbsolute(witDep.witPath)) {
                witDep.witPath = path.resolve(depPackageJsonPath, witDep.witPath);
            }
        });
    }
}

// Recursively retrieves dependencies that contain a 'knitwit' config section
export function getPackagesWithWasiDeps(
    dir: string,
    visited: Set<string> = new Set(),
    topLevel = true,
): DependencyResult {
    const packageJsonPath = path.join(dir, "package.json");
    const packageJson = readPackageJson(packageJsonPath);

    if (!packageJson) return [];

    // Collect all dependencies of package.json
    const dependencies = {
        ...packageJson.dependencies,
    };

    const result: DependencyResult = [];

    if (topLevel) {
        if (packageJson.config?.wasiDep) {
            if (packageJson.config.wasiDep.witDeps || packageJson.config.wasiDep.wellKnownWorlds) {
                if (packageJson.config.wasiDep.witDeps) {
                    absolutizeWitPath(dir, packageJson);
                }

                result.push({
                    name: packageJson.name,
                    config: {
                        wasiDep: {
                            ...(packageJson.config.wasiDep.witDeps && { witDeps: packageJson.config.wasiDep.witDeps }),
                            ...(packageJson.config.wasiDep.wellKnownWorlds && { wellKnownWorlds: packageJson.config.wasiDep.wellKnownWorlds }),
                        }
                    }
                });
            }
        }
    }

    // Iterate over each dependency and process its package.json
    Object.keys(dependencies).forEach((dep) => {
        const depPath = resolveDependencyPath(dir, dep, dependencies);
        const depPackageJsonPath = path.join(depPath, "package.json");

        if (fs.existsSync(depPackageJsonPath) && !visited.has(depPath)) {
            visited.add(depPath);
            const depPackageJson = readPackageJson(depPackageJsonPath);
            if (!depPackageJson) return;

            // Convert relative 'witPath' to an absolute path relative to root of package
            absolutizeWitPath(depPath, depPackageJson);

            // If the package has a 'knitwit' config, add it to the result
            if (depPackageJson.config?.wasiDep) {
                result.push({
                    name: dep, config: {
                        wasiDep: {
                            witDeps: depPackageJson.config.wasiDep.witDeps ?? undefined,
                            wellKnownWorlds: depPackageJson.config.wasiDep.wellKnownWorlds ?? undefined,
                        }
                    }
                });
            }

            // Recursively check dependencies of this package
            result.push(...getPackagesWithWasiDeps(depPath, visited, false));
        }
    });

    return result;
}


export function processWasiDeps(wasiDeps: DependencyResult) {
    let witPaths: string[] = [];
    let targetWorlds: TargetWorld[] = [];
    let wellKnownWorlds: string[] = [];

    wasiDeps.forEach((dep) => {
        if (dep.config?.wasiDep?.witDeps) {
            dep.config.wasiDep.witDeps.forEach((witDep) => {
                witPaths.push(witDep.witPath!);
                targetWorlds.push({ packageName: witDep.package, worldName: witDep.world });
            });
        }
        if (dep.config?.wasiDep?.wellKnownWorlds) {
            wellKnownWorlds.push(...dep.config.wasiDep.wellKnownWorlds);
        }
    });

    return { witPaths, targetWorlds, wellKnownWorlds };
}

export async function processWellKnownWorlds(wellKnownWorlds: string[]) {
    let witPaths: string[] = [];
    let targetWorlds: TargetWorld[] = [];

    for (let wellKnownWorld of wellKnownWorlds) {
        let { withPath, targetWorld } = await setupWellKnownWits(wellKnownWorld);
        witPaths.push(withPath);
        targetWorlds.push(targetWorld);
    }

    return { witPaths, targetWorlds };
}