#!/usr/bin/env node

import { componentize } from "@bytecodealliance/componentize-js";
import { getPackagesWithWasiDeps } from "./wasiDepsParser.js";
import { basename, join } from 'node:path';

import { calculateChecksum, fileExists, getExistingBuildData, getPackageVersion, saveBuildData } from "./utils.js";
import { getCliArgs } from "./cli.js";
import { getBuildDataPath, ShouldComponentize } from "./build.js";
import { readFile, writeFile } from "node:fs/promises";
import { mergeWit, TargetWorld } from "../lib/wit_tools.js"
import { setupWellKnownWits } from "./wellKnownWits.js";

import fs from 'node:fs/promises';
import { tmpdir } from "node:os";

async function main() {
  try {

    // Parse CLI args
    let CliArgs = getCliArgs()
    let src = CliArgs.input;
    let outputPath = CliArgs.output;

    // TODO: Once there is a new release of componentize-js, use the version exported from the module
    let componentizeVersion = await getPackageVersion("@bytecodealliance/componentize-js");

    // Small optimization to skip componentization if the source file hasn't changed
    if (await ShouldComponentize(src, outputPath, componentizeVersion)) {
      console.log("No changes detected in source file. Skipping componentization.");
      return;
    }

    // generate wit world string
    let wasiDeps = getPackagesWithWasiDeps(process.cwd(), new Set(), true);
    console.log(JSON.stringify(wasiDeps, null, 2))

    let witPaths: string[] = []
    let targetWorlds: TargetWorld[] = []
    let wellKnownWorlds: string[] = []
    wasiDeps.map((dep) => {
      if (dep.config?.wasiDep?.witDeps) {
        witPaths.push(dep.config.wasiDep.witDeps.witPath!)
        targetWorlds.push({ packageName: dep.config.wasiDep.witDeps.package, worldName: dep.config.wasiDep.witDeps.world })
      }
      if (dep.config?.wasiDep?.wellKnownWorlds) {
        wellKnownWorlds.push(...dep.config.wasiDep.wellKnownWorlds)
      }
    })

    let wellKnwonDirectories: string[] = []
    // If there any well known wits, add them to the witPaths and targetWorlds
    for (let wellKnownWorld of wellKnownWorlds) {
      let tempdir = await fs.mkdtemp(join(tmpdir(), "well-known-wits"));
      wellKnwonDirectories.push(tempdir);

      let targetWorld = await setupWellKnownWits(wellKnownWorld, tempdir);
      witPaths.push(tempdir);
      targetWorlds.push(targetWorld)
    }

    // Get inline wit by merging the wits specified by all the dependencies
    let inlineWit = mergeWit(witPaths, targetWorlds, "combined", "combined-wit:combined-wit@0.1.0")

    const source = await readFile(src, 'utf8');

    const { component } = await componentize(source, inlineWit, {
      sourceName: basename(src),
      // TODO: CHeck if we need to enable http
      //@ts-ignore
      enableFeatures: ["http"],
    });

    await writeFile(outputPath, component);

    // Save the checksum of the input file along with the componentize version
    await saveBuildData(getBuildDataPath(src), await calculateChecksum(src), componentizeVersion);

    console.log("Component successfully written.");
  }
  catch (error) {
    console.error("An error occurred during the componentization process:", error);
    console.error("Error:", error);
  }

}

main();
