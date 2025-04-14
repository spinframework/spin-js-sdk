import path from 'path';
import SpinSdkPlugin from "@spinframework/build-tools/plugins/webpack/index.js";

const config = async () => {
    let SpinPlugin = await SpinSdkPlugin.init()
    return {
        mode: 'production',
        stats: 'errors-only',
        entry: './src/index.js',
        experiments: {
            outputModule: true,
        },
        resolve: {
            extensions: ['.js'],
        },
        output: {
            path: path.resolve(process.cwd(), './build'),
            filename: 'bundle.js',
            module: true,
            library: {
                type: "module",
            }
        },
        plugins: [
            SpinPlugin
        ],
        optimization: {
            minimize: false
        },
    };
}
export default config