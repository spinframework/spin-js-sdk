WASI_SDK ?= /opt/wasi-sdk

target/release/spinjs: target/wasm32-wasi/release/spin-js-engine.wasm
	cd crates/spin-js-cli && \
	SPIN_JS_ENGINE_PATH=../../target/wasm32-wasi/release/spin_js_engine.wasm \
	cargo build --release $(BUILD_TARGET)

target/wasm32-wasi/release/spin-js-engine.wasm: crates/spin-js-engine/sdk.ts crates/spin-js-engine/src/lib.rs
	cd crates/spin-js-engine && \
	QUICKJS_WASM_SYS_WASI_SDK_PATH=$(WASI_SDK) \
	cargo build --release --target=wasm32-wasi

crates/spin-js-engine/sdk.ts: crates/spin-js-engine/src/js_sdk/sdk.ts
	cd crates/spin-js-engine/src/js_sdk && npx webpack --mode=production

.PHONY: clean
clean:
	rm -rf target crates/spin-js-engine/sdk.js
