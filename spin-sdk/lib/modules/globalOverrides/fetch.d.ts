/// <reference types="node" />
interface FetchOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: ArrayBuffer | Uint8Array | string;
}
interface FetchHeaders {
    entries: () => Iterator<[string, string]>;
    get: (key: string) => string | null;
    has: (key: string) => boolean;
}
interface FetchResult {
    status: number;
    headers: FetchHeaders;
    arrayBuffer: () => Promise<ArrayBuffer>;
    ok: boolean;
    statusText: string;
    text: () => Promise<string>;
    json: () => Promise<object>;
}
declare global {
    function fetch(uri: string | URL, options?: FetchOptions): Promise<FetchResult>;
}
export {};
