interface SpinConfig {
    get(arg0: string): string;
}
interface HttpRequest {
    method: string;
    uri: string;
    headers: Array<[string, string]>;
    body?: ArrayBuffer;
}
interface HttpResponse {
    status: number;
    headers: Map<string, string>;
    body?: ArrayBuffer;
}
declare type HandleRequest = (request: HttpRequest) => Promise<HttpResponse>;
interface SpinSDK {
    config: SpinConfig;
}
declare global {
    const spinSdk: SpinSDK;
    function fetch(uri: string, options?: object): Promise<FetchResult>;
    function atob(data: string): string;
    function btoa(data: string): string;
    const fsPromises: {
        readFile: (filename: string) => Promise<ArrayBuffer>;
    };
}
interface FetchHeaders {
    entries: () => Iterator<[string, string]>;
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
declare class URL {
    constructor(urlStr: string, base?: undefined);
}
export { HttpRequest, HttpResponse, HandleRequest };
