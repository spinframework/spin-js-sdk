class SpinSdkPlugin {
    constructor() {
        this.externals = [
            /^wasi:.*/,
            /^fermyon:.*/,
            /^spin:.*/,
        ];
    }

    apply(compiler) {
        // If externals are already defined, merge them with new externals
        const userExternals = compiler.options.externals;

        if (Array.isArray(userExternals)) {
            // Append to the existing array
            compiler.options.externals = [...userExternals, ...this.externals];
        } else if (typeof userExternals === 'object') {
            // Wrap in an array and add the object as-is
            compiler.options.externals = [userExternals, ...this.externals];
        } else {
            // Default: Just use our externals
            compiler.options.externals = [...this.externals];
        }
    }
}

module.exports = SpinSdkPlugin;
