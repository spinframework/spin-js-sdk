import fs from "fs";
import path from "path";

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
            witDeps?: {
                witPath: string;
                package: string;
                world: string;
            }
            wellKnownWorlds?: string[];
        };
    };
};

// Define the result structure containing package name and config
type DependencyResult = {
    name: string;
    config: {
        wasiDep: {
            witDeps?: {
                witPath: string;
                package: string;
                world: string;
            }
            wellKnownWorlds?: string[];
        }
    };
}[];

// Reads and parses a package.json file
function readPackageJson(packageJsonPath: string): PackageJson | null {
    if (!fs.existsSync(packageJsonPath)) return null;
    return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
}

// Resolves the absolute path of a dependency, checking both node_modules
function resolveDependencyPath(
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
    if (
        depPackageJson.config?.wasiDep?.witDeps &&
        !path.isAbsolute(depPackageJson.config.wasiDep.witDeps.witPath)
    ) {
        depPackageJson.config.wasiDep.witDeps.witPath = path.resolve(
            depPackageJsonPath,
            depPackageJson.config.wasiDep.witDeps.witPath,
        );
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

    // Collect all dependencies from different sections of package.json
    const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
        ...packageJson.peerDependencies,
        ...packageJson.optionalDependencies,
    };

    const result: DependencyResult = [];

    if (topLevel) {
        if (packageJson.config?.wasiDep) {
            console.log("in top level", packageJson.config.wasiDep.witDeps)
            if (packageJson.config.wasiDep.witDeps) {
                absolutizeWitPath(dir, packageJson);
                result.push({
                    name: packageJson.name,
                    config: {
                        wasiDep: {
                            witDeps: {
                                witPath: packageJson.config.wasiDep.witDeps.witPath,
                                package: packageJson.name,
                                world: packageJson.config.wasiDep.witDeps.world,
                            }
                        }
                    }
                });
            }
            console.log("in top level", packageJson.config.wasiDep.wellKnownWorlds)
            if (packageJson.config.wasiDep.wellKnownWorlds) {
                result.push({
                    name: packageJson.name,
                    config: {
                        wasiDep: {
                            wellKnownWorlds: packageJson.config.wasiDep.wellKnownWorlds,
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

