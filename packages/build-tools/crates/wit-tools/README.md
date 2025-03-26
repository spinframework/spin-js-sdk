# `wit-tools`

This crate provides useful functionality for mananging wit dependencies in projects. It currently provides the functionality of:
- Merging multiple `wit` packages and outputting a combined world.
- Getting all the imports of a given world. 

This crate can be compiled as a webassembly component and then consumed in language that do not have direct support for `wasm-tools` but has a wasm runtime capable of running components. (e.g) Can be used in Javascript programs using JCO. 

## Developing

The `wit` world that the library implements is defined in the [`wit` directory](./wit).

### Building

The component can be build by running 

```bash
cargo build --release
```
