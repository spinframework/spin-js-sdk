declare const _fsPromises: {
    readFile: (arg0: string) => ArrayBuffer
}

/** @internal */
const fsPromises = {
    readFile: (filename: string) =>  {
        return Promise.resolve(_fsPromises.readFile(filename))
    }
}

declare global {
    const fsPromises: {
        readFile: (filename: string) => Promise<ArrayBuffer>
    }
}

/** @internal */
export {fsPromises}