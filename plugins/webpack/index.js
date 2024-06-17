class SpinSdkPlugin {
    constructor() {
        this.externals = {
            "wasi:http/types@0.2.0": "wasi:http/types@0.2.0",
            "wasi:cli/environment@0.2.0": "wasi:cli/environment@0.2.0",
            "wasi:filesystem/preopens@0.2.0": "wasi:filesystem/preopens@0.2.0",
            "fermyon:spin/llm@2.0.0": "fermyon:spin/llm@2.0.0",
            "fermyon:spin/variables@2.0.0": "fermyon:spin/variables@2.0.0",
            "fermyon:spin/redis@2.0.0": "fermyon:spin/redis@2.0.0",
            "fermyon:spin/key-value@2.0.0": "fermyon:spin/key-value@2.0.0",
            "fermyon:spin/sqlite@2.0.0": "fermyon:spin/sqlite@2.0.0",
            "fermyon:spin/postgres@2.0.0": "fermyon:spin/postgres@2.0.0",
            "fermyon:spin/mysql@2.0.0": "fermyon:spin/mysql@2.0.0",
            "fermyon:spin/mqtt@2.0.0": "fermyon:spin/mqtt@2.0.0"
        };
    }

    apply(compiler) {
        // If externals are already defined, merge them with new externals
        if (compiler.options.externals && typeof compiler.options.externals === 'object') {
            this.externals = Object.assign({}, compiler.options.externals, this.externals);
        }
        compiler.options.externals = this.externals;
    }
}

module.exports = SpinSdkPlugin;
