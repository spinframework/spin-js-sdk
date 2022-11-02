/** @internal */
require('fast-text-encoding')
/** @internal */
import { Buffer } from 'buffer'
/** @internal */
const Url = require('url-parse')

interface SpinConfig {
    get(arg0: string): string
}

interface HttpRequest {
    method: string
    uri: string
    headers: Array<[string, string]>
    body?: ArrayBuffer
}

interface HttpResponse {
    status: number
    headers: Map<string, string>
    body?: ArrayBuffer
}

type HandleRequest = (request: HttpRequest) => Promise<HttpResponse>

interface SpinSDK {
    config: SpinConfig
    /** @internal */
    http: {
        send: (arg0: HttpRequest) => HttpResponse
    }
}

declare const _fsPromises: {
    readFile: (arg0: string) => ArrayBuffer
}

declare global {
    const spinSdk: SpinSDK
    function fetch(uri: string, options?: object) : Promise<FetchResult>
    function atob(data:string): string
    function btoa(data:string): string
    const fsPromises: {
        readFile: (filename: string) => Promise<ArrayBuffer>
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

/** @internal */
function atob(b64: string) {
    return Buffer.from(b64, "base64").toString()
}

/** @internal */
function btoa(data: string) {
    return Buffer.from(data).toString('base64')
}

class URL {
    constructor(urlStr: string, base = undefined) {
        let urlObj = Url(urlStr, base)

        return urlObj
    }
}

/** @internal */
const fsPromises = {
    readFile: (filename: string) =>  {
        return Promise.resolve(_fsPromises.readFile(filename))
    }
}

/** @internal */
export { atob, btoa, Buffer, fetch, fsPromises, URL}

// Stuff to be exported to the sdk types file
export { HttpRequest, HttpResponse, HandleRequest }

const statusTextList: { [key: string]: string } = {
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",
    103: "Early Hints",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    208: "Already reported",
    226: "IM Used",
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    306: "unused",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a teapot",
    421: "Misdirected Request",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "Http Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required"
}