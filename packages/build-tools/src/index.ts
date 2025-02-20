#!/usr/bin/env node

import { componentize } from "@bytecodealliance/componentize-js";
import { getPackagesWithWasiDeps, processWasiDeps, processWellKnownWorlds } from "./wasiDepsParser.js";
import { basename } from 'node:path';

import { calculateChecksum, getPackageVersion, saveBuildData } from "./utils.js";
import { getCliArgs } from "./cli.js";
import { getBuildDataPath, ShouldComponentize } from "./build.js";
import { readFile, writeFile } from "node:fs/promises";
import { mergeWit } from "../lib/wit_tools.js"

async function main() {
  try {
    // Parse CLI args
    let CliArgs = getCliArgs()
    let src = CliArgs.input;
    let outputPath = CliArgs.output;

    // TODO: Once there is a new release of componentize-js, use the version exported from the module
    let componentizeVersion = await getPackageVersion("@bytecodealliance/componentize-js");

    // Small optimization to skip componentization if the source file hasn't changed
    if (!await ShouldComponentize(src, outputPath, componentizeVersion)) {
      console.log("No changes detected in source file. Skipping componentization.");
      return;
    }
    console.log("Componentizing...");

    // generate wit world string
    let wasiDeps = getPackagesWithWasiDeps(process.cwd(), new Set(), true);

    let { witPaths, targetWorlds, wellKnownWorlds } = processWasiDeps(wasiDeps)
    let { witPaths: wellKnownWitPaths, targetWorlds: wellKnownTargetWorlds } = await processWellKnownWorlds(wellKnownWorlds);
    wellKnownWitPaths.forEach((path) => {
      witPaths.push(path)
    })
    wellKnownTargetWorlds.forEach((target) => {
      targetWorlds.push(target)
    })

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
