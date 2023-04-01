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
interface BaseHttpResponse {
    status: number;
    headers?: Record<string, string>;
}
interface HttpResponse extends BaseHttpResponse {
    body?: ArrayBuffer | string | Uint8Array;
}
declare type HandleRequest = (request: HttpRequest) => Promise<HttpResponse>;
declare type RdbmsParam = null | boolean | string | number | ArrayBuffer;
interface RdmsReturn {
    columns: string[];
    rows: [
        [
            RdbmsParam
        ]
    ];
}
interface SpinSDK {
    config: SpinConfig;
    redis: {
        execute: (address: string, command: string, args: Array<ArrayBuffer | bigint>) => undefined | string | bigint | ArrayBuffer;
        get: (address: string, key: string) => ArrayBuffer;
        incr: (address: string, key: string) => bigint;
        publish: (address: string, channel: string, value: ArrayBuffer) => undefined;
        set: (address: string, key: string, value: ArrayBuffer) => undefined;
        del: (address: string, key: Array<string>) => bigint;
        sadd: (address: string, key: string, values: Array<string>) => bigint;
        smembers: (address: string, key: string) => Array<string>;
        srem: (address: string, key: string, values: Array<string>) => bigint;
    };
    kv: {
        open: (name: string) => KvStore;
        openDefault: () => KvStore;
    };
    mysql: {
        execute: (address: string, statement: string, params: RdbmsParam[]) => void;
        query: (address: string, statement: string, params: RdbmsParam[]) => RdmsReturn;
    };
    pg: {
        execute: (address: string, statement: string, params: RdbmsParam[]) => void;
        query: (address: string, statement: string, params: RdbmsParam[]) => RdmsReturn;
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
declare class ResponseBuilder {
    response: HttpResponse;
    statusCode: number;
    constructor();
    getHeader(key: string): string | null;
    header(key: string, value: string): this;
    status(status: number): this;
    body(data: ArrayBuffer | Uint8Array | string): this;
}
declare type Handler = (request: HttpRequest, response: ResponseBuilder) => Promise<void>;
declare global {
    const spinSdk: SpinSDK;
    function fetch(uri: string | URL, options?: FetchOptions): Promise<FetchResult>;
    interface KvStore {
        delete: (key: string) => void;
        exists: (key: string) => boolean;
        get: (key: string) => ArrayBuffer | null;
        getKeys: () => Array<string>;
        set: (key: string, value: ArrayBuffer | string) => void;
    }
}
export { Handler, HttpRequest, HttpResponse, HandleRequest };
