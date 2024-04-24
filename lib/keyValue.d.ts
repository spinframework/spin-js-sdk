export interface Store {
    get: (key: string) => Uint8Array | null;
    set: (key: string, value: Uint8Array | string | object) => void;
    delete: (key: string) => void;
    exists: (key: string) => boolean;
    getKeys: () => string[];
    getJson: (key: string) => any;
    setJson: (key: string, value: any) => void;
}
export declare function open(label: string): Store;
export declare function openDefault(): Store;
