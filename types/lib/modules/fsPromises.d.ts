declare global {
    const fsPromises: {
        readFile: (filename: string) => Promise<ArrayBuffer>;
    };
}
export {};
