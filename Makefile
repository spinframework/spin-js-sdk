WASI_SDK ?= /opt/wasi-sdk

target/spin-http-js.wasm: dist/spin.js crates/spin-js-cli/target/release/spinjs
	mkdir -p target
	crates/spin-js-cli/target/release/spinjs -o $@ $<

dist/spin.js: src/index.js
	npx webpack --mode=production

crates/spin-js-cli/target/release/spinjs: crates/spin-js-engine/target/wasm32-wasi/release/spin-js-engine.wasm
	cd crates/spin-js-cli && \
	QUICKJS_WASM_SYS_BUILD_NATIVE=1 \
	SPIN_JS_ENGINE_PATH=../spin-js-engine/target/wasm32-wasi/release/spin_js_engine.wasm \
	cargo build --release

crates/spin-js-engine/target/wasm32-wasi/release/spin-js-engine.wasm: crates/spin-js-engine/src/lib.rs
	cd crates/spin-js-engine && \
	QUICKJS_WASM_SYS_WASI_SDK_PATH=$(WASI_SDK) \
	cargo build --release --target=wasm32-wasi

.PHONY: clean
clean:
	rm -rf dist target crates/spin-js-cli/target crates/spin-js-engine/target
