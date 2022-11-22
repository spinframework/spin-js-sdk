/** @internal */
import {statusTextList} from "./statusTextList"

interface SpinConfig {
    get(arg0: string): string
}

interface BaseHttpRequest {
    method: string
    uri: string
    body?: ArrayBuffer
}

interface SpinHttpRequest extends BaseHttpRequest {
    headers: Array<[string, string]>
}

interface HttpRequest extends BaseHttpRequest {
    headers: Record<string, string>
    json:() => object
    text: () => string
}

interface HttpResponse {
    status: number
    headers: Record<string, string>
    body?: ArrayBuffer
}

type HandleRequest = (request: HttpRequest) => Promise<HttpResponse>

interface SpinSDK {
    config: SpinConfig
    /** @internal */
    http: {
        send: (arg0: SpinHttpRequest) => HttpResponse
    }
    redis: {
        get: (address: string, key: string) => ArrayBuffer
        incr: (address: string, key: string) => bigint
        publish: (address: string, channel: string, value: ArrayBuffer) => undefined
        set: (address: string, key: string, value: ArrayBuffer) => undefined
        /* 
            Redis::del interface does not exist on cloud, leading to broken deploys
            uncomment after ready on cloud.
        */
        // del: (address: string, key: string) => bigint
    }
}

interface FetchOptions {
    method: string
    headers: object
}

interface FetchHeaders {
    entries: () => Iterator<[string, string]>
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
    let reqHeaders: Array<[string, string]> = []
    if (options && options.headers) {
        reqHeaders = Object.entries(options.headers)
    }
    const { status, headers, body } = spinSdk.http.send({
        method: (options && options.method) || "GET",
        uri,
        ...(options || {}),
        headers: reqHeaders
    })
    return Promise.resolve({
        status,
        headers: {
            entries: () => Object.entries(headers)
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
    function fetch(uri: string, options?: object) : Promise<FetchResult>
    
}

/** @internal */
export {fetch}

export { HttpRequest, HttpResponse, HandleRequest }
