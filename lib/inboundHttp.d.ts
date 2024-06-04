type ResolveFunction = (value: Response | PromiseLike<Response>) => void;
export declare class ResponseBuilder {
    headers: Headers;
    statusCode: number;
    private hasWrittenHeaders;
    private hasSentResponse;
    private resolveFunction;
    private streamController;
    constructor(resolve: ResolveFunction);
    status(code: number): ResponseBuilder;
    getStatus(): number;
    set(arg1: string | {
        [key: string]: string;
    } | Headers, arg2?: string): ResponseBuilder;
    send(value?: BodyInit): void;
    write(value: BodyInit): void;
    end(): void;
}
export {};
