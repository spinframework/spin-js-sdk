require('fast-text-encoding')

let encoder = new TextEncoder()

/** @internal */
import { statusTextList } from "./statusTextList"

interface SpinConfig {
    get(arg0: string): string
}

interface BaseHttpRequest {
    method: string
    uri: string
    body?: ArrayBuffer
    headers: Record<string, string>
}

interface HttpRequest extends BaseHttpRequest {
    json: () => object
    text: () => string
}

interface HttpResponse {
    status: number
    headers?: Record<string, string>
    body?: ArrayBuffer
}

type HandleRequest = (request: HttpRequest) => Promise<HttpResponse>

interface SpinSDK {
    config: SpinConfig
    /** @internal */
    http: {
        send: (arg0: BaseHttpRequest) => HttpResponse
    }
    redis: {
        get: (address: string, key: string) => ArrayBuffer
        incr: (address: string, key: string) => bigint
        publish: (address: string, channel: string, value: ArrayBuffer) => undefined
        set: (address: string, key: string, value: ArrayBuffer) => undefined
        del: (address: string, key: Array<string>) => bigint
        sadd: (address: string, key: string, values: Array<string>) => bigint
        smembers: (address: string, key: string) => Array<string>
        srem: (address: string, key: string, values: Array<string>) => bigint
    }
}

interface FetchOptions {
    method?: string
    headers?: Record<string, string>
    body?: ArrayBuffer | Uint8Array | string
}

interface FetchHeaders {
    entries: () => Iterator<[string, string]>
    get: (key: string) => string | null
    has: (key: string) => boolean
}

interface FetchResult {
    status: number
    headers: FetchHeaders
    arrayBuffer: () => Promise<ArrayBuffer>
    ok: boolean
    statusText: string
    text: () => Promise<string>
    json: () => Promise<object>
}

/** @internal */
function encodeBody(body: ArrayBuffer | Uint8Array | string) {
    if (typeof (body) == "string") {
        return encoder.encode(body).buffer
    } else if (ArrayBuffer.isView(body)) {
        return body.buffer
    } else {
        return body
    }
}


/** @internal */
function fetch(uri: string, options?: FetchOptions) {
    let encodedBodyData = (options && options.body) ? encodeBody(options.body) : new Uint8Array().buffer
    const { status, headers, body } = spinSdk.http.send({
        method: (options && options.method) || "GET",
        uri,
        headers: (options && options.headers) || {},
        body: encodedBodyData,
    })
    return Promise.resolve({
        status,
        headers: {
            entries: () => Object.entries(headers || {}),
            get: (key: string) => (headers && headers[key]) || null,
            has: (key: string) => (headers && headers[key]) ? true : false
        },
        arrayBuffer: () => Promise.resolve(body),
        ok: (status > 199 && status < 300),
        statusText: statusTextList[status],
        text: () => Promise.resolve(new TextDecoder().decode(body || new Uint8Array())),
        json: () => {
            let text = new TextDecoder().decode(body || new Uint8Array())
            return Promise.resolve(JSON.parse(text))
        }
    })
}

class ResponseBuilder {
    response: HttpResponse
    statusCode: number
    constructor() {
        this.response = {
            status: 200,
            headers: {}
        }
        this.statusCode = this.response.status
    }
    getHeader(key: string) {
        return this.response.headers![key] || null
    }
    header(key: string, value: string) {
        this.response.headers![key] = value
        return this
    }
    status(status: number) {
        this.response.status! = status
        this.statusCode = this.response.status
        return this
    }
    body(data: ArrayBuffer | Uint8Array | string) {
        this.response.body = encodeBody(data)
        return this
    }
 }
 

/** @internal */
declare global {
    const spin: {
        handleRequest(request: HttpRequest): Promise<HttpResponse>
        handler(request: HttpRequest, response: ResponseBuilder): Promise<HttpResponse>
    }
}

/** @internal */
const spinInternal = {
    _handleRequest: async function (request: HttpRequest): Promise<HttpResponse> {

        let data = await spin.handleRequest(request)
        let encodedBodyData = (data && data.body) ? encodeBody(data.body) : undefined

        return {
            status: data.status,
            headers: data.headers || {},
            body: encodedBodyData || new Uint8Array().buffer
        }
    },
    _handler: async function (request: HttpRequest): Promise<HttpResponse> {

        let response = new ResponseBuilder()
        await spin.handler(request, response)

        return {
            status: response.response.status,
            headers: response.response.headers || {},
            body: response.response.body || new Uint8Array().buffer
        }
    }
}

type Handler = (request: HttpRequest, response: ResponseBuilder) => Promise<void>


declare global {
    const spinSdk: SpinSDK
    function fetch(uri: string, options?: FetchOptions): Promise<FetchResult>
}

/** @internal */
export { fetch, spinInternal }

export { Handler, HttpRequest, HttpResponse, HandleRequest }
