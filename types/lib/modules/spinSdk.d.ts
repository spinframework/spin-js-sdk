interface SpinConfig {
    get(arg0: string): string;
}
interface BaseHttpRequest {
    method: string;
    uri: string;
    body?: ArrayBuffer;
    headers: Record<string, string>;
}
interface HttpRequest extends BaseHttpRequest {
    json: () => object;
    text: () => string;
}
interface HttpResponse {
    status: number;
    headers?: Record<string, string>;
    body?: ArrayBuffer;
}
declare type HandleRequest = (request: HttpRequest) => Promise<HttpResponse>;
interface SpinSDK {
    config: SpinConfig;
    redis: {
        get: (address: string, key: string) => ArrayBuffer;
        incr: (address: string, key: string) => bigint;
        publish: (address: string, channel: string, value: ArrayBuffer) => undefined;
        set: (address: string, key: string, value: ArrayBuffer) => undefined;
        del: (address: string, key: Array<string>) => bigint;
        sadd: (address: string, key: string, values: Array<string>) => bigint;
        smembers: (address: string, key: string) => Array<string>;
        srem: (address: string, key: string, values: Array<string>) => bigint;
    };
}
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
    const spinSdk: SpinSDK;
    function fetch(uri: string | URL, options?: FetchOptions): Promise<FetchResult>;
}
export { HttpRequest, HttpResponse, HandleRequest };
