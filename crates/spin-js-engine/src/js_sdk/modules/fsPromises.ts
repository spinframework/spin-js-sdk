interface ReadDirOptions {
    withFileTypes: boolean
}

interface ReadDirWithFileTypes {
    name: string
    isFile: () => boolean
    isDirectory: () => boolean
    isSymboliclink: () => boolean
}

declare const _fsPromises: {
    readFile: (arg0: string) => ArrayBuffer
    readDir: {
        (arg0: string): Array<string>
        (arg0: string, arg1: ReadDirOptions & object): Array<ReadDirWithFileTypes>
    }
}

const fsPromises = {
    readFile: (filename: string) => {
        return Promise.resolve(_fsPromises.readFile(filename))
    },
    readdir: (dirname: string, options?: ReadDirOptions) => {
        if (options && options.withFileTypes == true) {
            let res = _fsPromises.readDir(dirname, options)
            return Promise.resolve(res)
        }
        return Promise.resolve(_fsPromises.readDir(dirname))
    }
}


declare global {
    const fsPromises: {
        readFile: (filename: string) => Promise<ArrayBuffer>,
        readdir: {
            (dirname: string, options: {withFileTypes: true}): Promise<Array<ReadDirWithFileTypes>>;
            (dirname: string, options?: ReadDirOptions): Promise<Array<string>>;
            (dirname: string, options: {withFileTypes?: false | undefined}): Promise<Array<string>>;
        }
    }
}

export { fsPromises }