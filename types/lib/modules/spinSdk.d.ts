interface SpinConfig {
    get(arg0: string): string;
}
interface SpinHttpRequest {
    method: string;
    uri: string;
    headers: Array<[string, string]>;
    body?: ArrayBuffer;
}
interface HttpRequest extends SpinHttpRequest {
    json: () => object;
    text: () => string;
}
interface HttpResponse {
    status: number;
    headers: Record<string, string>;
    body?: ArrayBuffer;
}
declare type HandleRequest = (request: HttpRequest) => Promise<HttpResponse>;
interface SpinSDK {
    config: SpinConfig;
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
declare global {
    const spinSdk: SpinSDK;
    function fetch(uri: string, options?: object): Promise<FetchResult>;
}
export { HttpRequest, HttpResponse, HandleRequest };
