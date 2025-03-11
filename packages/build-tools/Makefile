CARGO_BUILD_TARGET = wasm32-wasip1
WASM_FILE = target/wasm32-wasip1/release/wit_tools.wasm
OUTPUT_DIR = obj
OUTPUT_WASM = $(OUTPUT_DIR)/wit_tools.wasm
LIB_DIR = lib

all: build

build:
	cargo build --release --target $(CARGO_BUILD_TARGET)
	mkdir -p $(OUTPUT_DIR)
	jco new $(WASM_FILE) -o $(OUTPUT_WASM) --wasi-reactor
	jco transpile -q --name wit_tools $(OUTPUT_WASM) -o $(LIB_DIR) -- -O1

clean:
	cargo clean
	rm -rf $(OUTPUT_DIR)
	rm -rf $(LIB_DIR)

.PHONY: all build clean