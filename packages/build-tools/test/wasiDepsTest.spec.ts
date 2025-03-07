import fs from "fs";
import { getPackagesWithWasiDeps, processWasiDeps, readPackageJson, resolveDependencyPath } from "../dist/wasiDepsParser.js";
import { expect } from "chai";
import sinon from "sinon";

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("readPackageJson", () => {
    let existsSyncStub, readFileSyncStub;
    beforeEach(() => {
        existsSyncStub = sinon.stub(fs, "existsSync");
        readFileSyncStub = sinon.stub(fs, "readFileSync");
    });
    afterEach(() => {
        sinon.restore();
    });

    it("should return null if package.json does not exist", () => {
        existsSyncStub.returns(false);
        expect(readPackageJson("/path/to/package.json")).to.be.null;
    });

    it("should return parsed JSON if package.json exists", () => {
        existsSyncStub.returns(true);
        readFileSyncStub.returns(JSON.stringify({ name: "test-package" }));
        expect(readPackageJson("/path/to/package.json")).to.deep.equal({ name: "test-package" });
    });
});

describe("resolveDependencyPath", () => {
    let existsSyncStub
    beforeEach(() => {
        existsSyncStub = sinon.stub(fs, "existsSync");
    });
    afterEach(() => {
        sinon.restore();
    });
    it("should return node_modules path if dependency exists", () => {
        existsSyncStub.returns(true);
        expect(resolveDependencyPath("/project", "dep")).to.equal("/project/node_modules/dep");
    });
});

describe("getPackagesWithWasiDeps", () => {
    let existsSyncStub, readFileSyncStub;
    beforeEach(() => {
        existsSyncStub = sinon.stub(fs, "existsSync");
        readFileSyncStub = sinon.stub(fs, "readFileSync");
    });
    afterEach(() => {
        sinon.restore();
    });

    it("should return an empty array if package.json does not exist", () => {
        existsSyncStub.returns(false);
        expect(getPackagesWithWasiDeps("/project")).to.deep.equal([]);
    });

    it("should return the package if it has wasiDep config", () => {
        const packageJson = {
            name: "test-package",
            config: {
                witDeps: [{ witPath: "./test.wit", package: "test-pkg", world: "test-world" }],
            }
        };
        existsSyncStub.returns(true);
        readFileSyncStub.returns(JSON.stringify(packageJson));
        expect(getPackagesWithWasiDeps("/project")).to.deep.equal([
            {
                name: "test-package",
                config: {
                    witDeps: [{ witPath: "/project/test.wit", package: "test-pkg", world: "test-world" }]
                }
            }
        ]);
    });
});

describe("processWasiDeps", () => {
    it("should correctly process wasiDeps", () => {
        const wasiDeps = [
            {
                name: "test-package",
                config: {
                    witDeps: [{ witPath: "./test.wit", package: "test-pkg", world: "test-world" }],
                }
            }
        ];
        expect(processWasiDeps(wasiDeps)).to.deep.equal({
            witPaths: ["./test.wit"],
            targetWorlds: [{ packageName: "test-pkg", worldName: "test-world" }],
        });
    });
});

describe("getPackagesWithWasiDeps (recursive)", () => {
    let existsSyncStub, readFileSyncStub;

    beforeEach(() => {
        existsSyncStub = sinon.stub(fs, "existsSync");
        readFileSyncStub = sinon.stub(fs, "readFileSync");
    });

    afterEach(() => {
        sinon.restore();
    });

    it("should collect dependencies recursively that contain a wasiDep config", async () => {
        // Simulate the first package with a wasiDep config
        const packageJson1 = {
            name: "package-1",
            dependencies: {
                "package-2": "^1.0.0"
            },
            config: {
                witDeps: [{ witPath: "./test1.wit", package: "test-pkg-1", world: "world-1" }],
            }
        };

        // Simulate the second package (dependency of package-1)
        const packageJson2 = {
            name: "package-2",
            dependencies: {
                "package-3": "^1.0.0",
                // This package is installed inside the node_modules of package-2
                "package-4": "^1.0.0"
            },
            config: {
                witDeps: [{ witPath: "./test2.wit", package: "test-pkg-2", world: "world-2" }],
            }
        };

        // Simulate the third package (dependency of package-2)
        const packageJson3 = {
            name: "package-3",
            dependencies: {
                "package-5": "^1.0.0"
            },
            config: {
                witDeps: [{ witPath: "./test3.wit", package: "test-pkg-3", world: "world-3" }],
            }
        };

        const packageJson4 = {
            name: "package-4",
            config: {
                witDeps: [{ witPath: "./test4.wit", package: "test-pkg-4", world: "world-4" }],
            }
        };

        const packageJson5 = {
            name: "package-5",
            config: {
                witDeps: [{ witPath: "./test5.wit", package: "test-pkg-5", world: "world-5" }],
            }
        };

        // Stubbing file existence and content reading
        existsSyncStub.withArgs("/project/package.json").returns(true);
        readFileSyncStub.withArgs("/project/package.json").returns(JSON.stringify(packageJson1));

        existsSyncStub.withArgs("/project/node_modules/package-2").returns(true);
        existsSyncStub.withArgs("/project/node_modules/package-2/package.json").returns(true);
        readFileSyncStub.withArgs("/project/node_modules/package-2/package.json").returns(JSON.stringify(packageJson2));

        existsSyncStub.withArgs("/project/node_modules/package-3").returns(true);
        existsSyncStub.withArgs("/project/node_modules/package-3/package.json").returns(true);
        readFileSyncStub.withArgs("/project/node_modules/package-3/package.json").returns(JSON.stringify(packageJson3));

        existsSyncStub.withArgs("/project/node_modules/package-2/node_modules/package-4").returns(true);
        existsSyncStub.withArgs("/project/node_modules/package-2/node_modules/package-4/package.json").returns(true);
        readFileSyncStub.withArgs("/project/node_modules/package-2/node_modules/package-4/package.json").returns(JSON.stringify(packageJson4));

        existsSyncStub.withArgs("/project/node_modules/package-5").returns(true);
        existsSyncStub.withArgs("/project/node_modules/package-5/package.json").returns(true);
        readFileSyncStub.withArgs("/project/node_modules/package-5/package.json").returns(JSON.stringify(packageJson5));

        // Calling the function and asserting the result
        let visited: Set<string> = new Set()
        let result = getPackagesWithWasiDeps("/project", visited, true);

        let { witPaths, targetWorlds } = processWasiDeps(result);


        expect(witPaths.length).to.equal(5);
        expect(targetWorlds.length).to.equal(5);
        expect(witPaths).to.deep.equal([
            "/project/test1.wit",
            "/project/node_modules/package-2/test2.wit",
            "/project/node_modules/package-3/test3.wit",
            "/project/node_modules/package-5/test5.wit",
            "/project/node_modules/package-2/node_modules/package-4/test4.wit"
        ]);
        expect(targetWorlds).to.deep.equal([
            { packageName: "test-pkg-1", worldName: "world-1" },
            { packageName: "test-pkg-2", worldName: "world-2" },
            { packageName: "test-pkg-3", worldName: "world-3" },
            { packageName: "test-pkg-5", worldName: "world-5" },
            { packageName: "test-pkg-4", worldName: "world-4" }
        ]);
    });
});
