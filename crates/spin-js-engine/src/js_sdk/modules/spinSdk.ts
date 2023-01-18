/** @internal */
import {statusTextList} from "./statusTextList"

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
    json:() => object
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
    body?: ArrayBuffer
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
function fetch(uri: string, options?: FetchOptions) {
    const { status, headers, body } = spinSdk.http.send({
        method: (options && options.method) || "GET",
        uri,
        headers: (options && options.headers) || {},
        body: options && options.body,
    })
    return Promise.resolve({
        status,
        headers: {
            entries: () => Object.entries(headers || {}),
            get:(key: string) => (headers && headers[key]) || null,
            has:(key: string) => (headers && headers[key]) ? true : false
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

declare global {
    const spinSdk: SpinSDK
    function fetch(uri: string, options?: FetchOptions) : Promise<FetchResult>
}

/** @internal */
export {fetch}

export { HttpRequest, HttpResponse, HandleRequest }
