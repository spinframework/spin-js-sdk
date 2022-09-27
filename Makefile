WASI_SDK ?= /opt/wasi-sdk

target/spin-http-js.wasm: dist/spin.js target/release/spinjs
	mkdir -p target
	target/release/spinjs -o $@ $<

dist/spin.js: src/index.js
	npx webpack --mode=production

target/release/spinjs: target/wasm32-wasi/release/spin-js-engine.wasm
	cd crates/spin-js-cli && \
	SPIN_JS_ENGINE_PATH=../../target/wasm32-wasi/release/spin_js_engine.wasm \
	cargo build --release

target/wasm32-wasi/release/spin-js-engine.wasm: crates/spin-js-engine/sdk.js crates/spin-js-engine/src/lib.rs
	cd crates/spin-js-engine && \
	QUICKJS_WASM_SYS_WASI_SDK_PATH=$(WASI_SDK) \
	cargo build --release --target=wasm32-wasi

crates/spin-js-engine/sdk.js: crates/spin-js-engine/src/js_sdk/sdk.js
	cd crates/spin-js-engine/src/js_sdk && npx webpack --mode=production

.PHONY: clean
clean:
	rm -rf dist target crates/spin-js-engine/sdk.js
