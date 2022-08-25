## spin-http-js

This is an example of how to build and run a Spin HTTP trigger written in
JavaScript.  It borrows heavily from [Javy](https://github.com/Shopify/javy),
using the same approach of providing a CLI utility to convert a JS file into a
Wasm file.  In this case, the utility is part of the source tree, but in normal
operation we'll probably make it a Spin plugin which JS devs can use without
having to build or install Rust code themselves.

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
