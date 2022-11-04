interface ReadDirOptions {
    withFileTypes: boolean;
}
interface ReadDirWithFileTypes {
    name: string;
    isFile: () => boolean;
    isDirectory: () => boolean;
    isSymboliclink: () => boolean;
}
declare global {
    const fsPromises: {
        readFile: (filename: string) => Promise<ArrayBuffer>;
        readdir: {
            (dirname: string, options: {
                withFileTypes: true;
            }): Promise<Array<ReadDirWithFileTypes>>;
            (dirname: string, options?: ReadDirOptions): Promise<Array<string>>;
            (dirname: string, options: {
                withFileTypes?: false | undefined;
            }): Promise<Array<string>>;
        };
    };
}
export {};
