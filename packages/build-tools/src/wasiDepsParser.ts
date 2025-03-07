import fs from "fs";
import { TargetWorld } from "../lib/wit_tools.js";
import path from "path";


// Define the structure of a package.json file
// Includes dependencies and an optional config section for 'knitwit'
type PackageJson = {
    name: string,
    dependencies?: Record<string, string>;
    config?: {
        witDeps?: witDep[];
    }
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
        witDeps?: witDep[];
    }
}[];

// Reads and parses a package.json file
export function readPackageJson(packageJsonPath: string): PackageJson | null {
    if (!fs.existsSync(packageJsonPath)) return null;
    return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
}

// Resolves the absolute path of a dependency, checking both node_modules
export function resolveDependencyPath(
    rootDir: string,
    dep: string
): string {
    let currentDir = rootDir;

    while (currentDir !== path.parse(currentDir).root) {
        const depPath = path.join(currentDir, "node_modules", dep);
        if (fs.existsSync(depPath)) {
            return depPath;
        }
        currentDir = path.dirname(currentDir); // Move up one level
    }

    // Fallback: Try Node.js module resolution logic
    try {
        return path.dirname(require.resolve(dep, { paths: [rootDir] }));
    } catch {
        throw new Error(`Dependency '${dep}' not found in '${rootDir}' or any parent node_modules`);
    }
}

// Converts the 'witPath' inside the config section to an absolute path if it is relative
function absolutizeWitPath(depPackageJsonPath: string, depPackageJson: PackageJson): void {
    if (depPackageJson.config?.witDeps) {
        depPackageJson.config.witDeps.forEach((witDep) => {
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
        if (packageJson.config?.witDeps) {
            if (packageJson.config.witDeps) {
                if (packageJson.config.witDeps) {
                    absolutizeWitPath(dir, packageJson);
                }

                result.push({
                    name: packageJson.name,
                    config: {
                        witDeps: packageJson.config.witDeps
                    }
                });
            }
        }
    }

    // Iterate over each dependency and process its package.json
    Object.keys(dependencies).forEach((dep) => {
        const depPath = resolveDependencyPath(dir, dep);
        const depPackageJsonPath = path.join(depPath, "package.json");

        if (fs.existsSync(depPackageJsonPath) && !visited.has(depPath)) {
            visited.add(depPath);
            const depPackageJson = readPackageJson(depPackageJsonPath);
            if (!depPackageJson) return;

            // Convert relative 'witPath' to absolute
            absolutizeWitPath(depPath, depPackageJson);

            // If the package has a 'knitwit' config, add it to the result
            if (depPackageJson.config?.witDeps) {
                result.push({
                    name: dep,
                    config: {
                        witDeps:
                            depPackageJson.config.witDeps ?? [],
                    }
                });
            }

            // Recursively check dependencies
            result.push(...getPackagesWithWasiDeps(depPath, visited, false));
        }
    });

    return result;
}


export function processWasiDeps(wasiDeps: DependencyResult) {
    let witPaths: string[] = [];
    let targetWorlds: TargetWorld[] = [];

    wasiDeps.forEach((dep) => {
        if (dep.config?.witDeps) {
            dep.config.witDeps.forEach((witDep) => {
                witPaths.push(witDep.witPath!);
                targetWorlds.push({ packageName: witDep.package, worldName: witDep.world })
            });
        }
    });

    return { witPaths, targetWorlds };
}