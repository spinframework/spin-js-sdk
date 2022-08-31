## spin-js-sdk

This is an experimental SDK for building Spin apps using JavaScript (and TypeScript, etc.).  It borrows heavily from [Javy](https://github.com/Shopify/javy), using the same approach of providing a CLI utility to convert a JS file into a Wasm file.  Ultimately we plan to package this as a Spin plugin which can be invoked from an NPM build script as the final step.

The top level directory contains an example HTTP trigger implemented using NPM, Webpack, etc.  See [src/index.js](src/index.js) for details

## Building

### Prerequisites

- Make
- NPM
- Rust (including the wasm32-wasi target)
- WASI SDK installed at /opt/wasi-sdk

### Steps

```bash
npm install
make
spin up --follow-all
```

Use e.g. `curl -v http://127.0.0.1:3000/hello` to test that it's working.
