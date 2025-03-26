# `@spinframework/build-tools`

This pacakge provides tooling for building wasm components from JavaScript source code. 

## Contents of the package

### Build Tool CLI

The package also provides a node executable `j2w` that enables compiling JS source code to wasm components.  

```bash
$ npx j2w --help
Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -i, --input    Path to the input file                               [required]
  -o, --output   Path to the output file             [default: "component.wasm"]
      --aot      Enable Ahead of Time compilation                      [boolean]
  -d, --debug    Enable JavaScript debugging                           [boolean]
```

**Note:** The input source should be Javascript. 

#### `wit-tools` crate

This crate provides tools for interacting with `wit` files. It is compiled into a wasm component and then consumed from the CLI.

### Webpack Plugin

The webpack plugin can be found at [`./plugins/webpack/index.js`](./plugins/webpack/index.js). It can be used to add externals (modules that will be available at runtime) to the config automatically based on the `wit` imports of the packages being bundled. The plugin needs to be initialized before it can be used. The initialization is `async`, so it has to be awaited. A example usage:

```js
import SpinSdkPlugin from "@spinframework/build-tools/plugins/webpack/index.js";
const config = async () => {
    return {
        ...
        plugins: [
            await SpinSdkPlugin.init()
        ]
    }
}

export default config
```

## How the Build System Works

The build system works by parsing through the dependencies of a package as defined in the `package.json`. It recursively parses the dependencies to parse out all the package that have a `wit` dependency. The list of `wit` dependencies is then used to create a merged target world which is the union of all the dependencies. 

### Configuring `package.json` for `wit` Dependencies

For packages that leverage `wit` dependencies, they need to configure the `package.json` to include information about the location of the `wit`, the target world and the package name. The configuration needs nested under a `witDependencies` field  be under the `config` field of the `package.json`. An example configuration:

```json
...
"config": {
    "witDependencies": [
      {
        "witPath": "./wit",
        "package": "spinframework:wasi-cli-environment@0.2.3",
        "world": "wasi-cli"
      }
    ]
  }
...
```

### Testing the package

The package has some tests for the `wit` dependency parser and can be run using 

```bash
npm run test
```

**Note:** Make sure to have a new enough version of `node.js`that can run typescript natively.