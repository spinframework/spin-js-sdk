use std::env;
use std::fs;
use std::path::PathBuf;

fn main() {
    if let Ok("cargo-clippy") = env::var("CARGO_CFG_FEATURE").as_ref().map(String::as_str) {
        stub_engine_for_clippy();
    } else {
        copy_engine_binary();
    }
}

fn stub_engine_for_clippy() {
    let engine_path = PathBuf::from(env::var("OUT_DIR").unwrap()).join("engine.wasm");

    if !engine_path.exists() {
        std::fs::write(engine_path, []).expect("failed to write empty engine.wasm stub");
        println!("cargo:warning=using stubbed engine.wasm for static analysis purposes...");
    }
}

// Copy the engine binary build from the `spin-js-engine` crate
fn copy_engine_binary() {
    let override_engine_path = env::var("SPIN_JS_ENGINE_PATH");
    let engine_path = if let Ok(path) = override_engine_path {
        PathBuf::from(path)
    } else {
        let mut path = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap());
        path.pop();
        path.pop();
        path.join("target/wasm32-wasi/release/spin_js_engine.wasm")
    };

    println!("cargo:rerun-if-changed={:?}", engine_path);
    println!("cargo:rerun-if-changed=build.rs");

    if engine_path.exists() {
        let copied_engine_path = PathBuf::from(env::var("OUT_DIR").unwrap()).join("engine.wasm");

        fs::copy(&engine_path, &copied_engine_path).unwrap();
    }
}
