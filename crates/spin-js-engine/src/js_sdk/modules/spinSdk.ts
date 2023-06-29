require('fast-text-encoding')

let encoder = new TextEncoder()
let decoder = new TextDecoder()

import { statusTextList } from "./statusTextList"

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

interface BaseHttpResponse {
    status: number
    headers?: Record<string, string>
}

interface InternalHttpResponse extends BaseHttpResponse {
    body?: ArrayBuffer
}

interface HttpResponse extends BaseHttpResponse {
    body?: ArrayBuffer | string | Uint8Array
}


type RdbmsParam = null | boolean | string | number | ArrayBuffer
interface RdmsReturn {
    columns: string[],
    rows: [
        [RdbmsParam]
    ]
}
interface SpinSDK {
    http: {
        send: (arg0: BaseHttpRequest) => InternalHttpResponse
    }
}

interface FetchOptions {
    method?: string
    headers?: Record<string, string>
    body?: ArrayBuffer | Uint8Array | string
}

interface FetchHeaders {
    entries: () => [string, string][]
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
function fetch(uri: string | URL, options?: FetchOptions) {
    let encodedBodyData = (options && options.body) ? encodeBody(options.body) : new Uint8Array().buffer
    const { status, headers, body } = __internal__.spin_sdk.http.send({
        method: (options && options.method) || "GET",
        uri: (uri instanceof URL) ? uri.toString() : uri,
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
        request.text = () => { return decoder.decode(request.body) }
        request.json = () => { return JSON.parse(decoder.decode(request.body)) }
        let data = await spin.handleRequest(request)
        let encodedBodyData = (data && data.body) ? encodeBody(data.body) : undefined

        return {
            status: data.status,
            headers: data.headers || {},
            body: encodedBodyData || new Uint8Array().buffer
        }
    },
    _handler: async function (request: HttpRequest): Promise<HttpResponse> {
        request.text = () => { return decoder.decode(request.body) }
        request.json = () => { return JSON.parse(decoder.decode(request.body)) }
        let response = new ResponseBuilder()
        await spin.handler(request, response)

        return {
            status: response.response.status,
            headers: response.response.headers || {},
            body: response.response.body || new Uint8Array().buffer
        }
    }
}

declare global {
    const __internal__: {
        spin_sdk: SpinSDK
        console: {
            log: (...args: any) => void
        }
    }
}

/** @internal */
export { fetch, spinInternal }

