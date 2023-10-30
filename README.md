## spin-js-sdk

This is an experimental SDK for building Spin apps using JavaScript (and TypeScript, etc.).  It borrows heavily from [Javy](https://github.com/Shopify/javy), using the same approach of providing a CLI utility to convert a JS file into a Wasm file.  Ultimately we plan to package this as a Spin plugin which can be invoked from an NPM build script as the final step.

The top level directory contains an example HTTP trigger implemented using NPM, Webpack, etc.  See [src/index.js](src/index.js) for details

## Using the SDK

To build spin components from js, the Spin plugin `js2wasm` needs to be installed. It can be installed with the following commands:

```bash
spin plugin update
spin plugin install js2wasm
```

When prompted, choose "y" after reviewing the license and the source of the package.

Once the plugin is installed, it can be invoked as:

```bash
$ spin js2wasm --help
js2wasm 0.1.0
A spin plugin to convert JavaScript files to Spin compatible modules

USAGE:
    js2wasm [OPTIONS] <input>

FLAGS:
    -h, --help       Prints help information
    -V, --version    Prints version information

OPTIONS:
    -o <output>         [default: index.wasm]

ARGS:
    <input>
```

This plugin takes in a JavaScript file and converts it into a Spin compatible `.wasm` modules

## Installing the templates

The JavaScript and TypeScript templates can be installed using the following command:

```bash
$ spin templates install --git https://github.com/fermyon/spin-js-sdk

Copying remote template source
Installing template http-ts...
Installing template http-js...
Installed 2 template(s)

+-------------------------------------------------+
| Name      Description                           |
+=================================================+
| http-js   HTTP request handler using JavaScript |
| http-ts   HTTP request handler using TypeScript |
+-------------------------------------------------+
```

Once the templates are installed, a new TypeScript project can be instantiated using:

```bash
spin new -t http-ts hello_world --accept-defaults
```

To run the created template:

```bash
cd hello-world
npm install
spin build
spin up
```

## Building

You need to build the SDK from source to use it.

### Prerequisites

- Make
- CMake
- NPM
- Rust (including the wasm32-wasi target)
- WASI SDK ([version 16.0](https://github.com/WebAssembly/wasi-sdk/releases/tag/wasi-sdk-16)) installed at /opt/wasi-sdk

### Steps

#### Setup SDK
```bash
npm install --prefix crates/spin-js-engine/src/js_sdk
make
```

The build produces the `spinjs` utility, which is used to build wasm modules from JavaScript or TypeScript source. For convenience you can move `spinjs` to a directory in your path - e.g., `sudo cp target/release/spinjs /usr/local/bin/spinjs`.

#### Build and run the examples

There are some examples provided in the [examples](./examples/) directory. Each example has a readme on building and running it.

Ensure you have the [latest version of Spin](https://developer.fermyon.com/spin/install) and the [js2wasm plugin](#using-the-sdk) installed.

__Note__: These examples track Spin's `main` branch, so you may need to ensure you are using the [canary](https://github.com/fermyon/spin/releases/tag/canary) Spin release.
