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
type HandleRequest = (request: HttpRequest) => Promise<HttpResponse>;
type Handler = (request: HttpRequest, response: ResponseBuilder) => Promise<void>;
declare class ResponseBuilder {
    response: HttpResponse;
    statusCode: number;
    constructor();
    getHeader(key: string): string | null;
    header(key: string, value: string): this;
    status(status: number): this;
    body(data: ArrayBuffer | Uint8Array | string): this;
}
export { ResponseBuilder, HandleRequest, Handler, HttpRequest, HttpResponse };
