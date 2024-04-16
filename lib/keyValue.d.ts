export interface SpinKvStore {
    get: (key: string) => Uint8Array | null;
    set: (key: string, value: Uint8Array | string) => void;
    delete: (key: string) => void;
    exists: (key: string) => boolean;
    getKeys: () => string[];
    getJson: (key: string) => any;
    setJson: (key: string, value: any) => void;
}
export declare const KeyValue: {
    open: (label: string) => SpinKvStore;
    openDefault: () => SpinKvStore;
};
