export interface method {
    tag: "get" | "head" | "post" | "put" | "delete" | "connect" | "options" | "trace" | "patch" | { kind: "other", value: string }
}

export interface schema {
    tag: "HTTP" | "HTTPS" | { kind: "other", value: string }
}

export type FieldValue = Uint8Array
export type FieldKey = string

export declare class headers {
    constructor()
    static fromList: (entries: [FieldKey, FieldValue][]) => headers
    get: (name: FieldKey) => FieldValue[]
    has: (name: FieldKey) => boolean
    set: (name: FieldKey, value: FieldValue) => void
    delete: (name: FieldKey) => void
    append: (name: FieldKey, value: FieldValue) => void
    entries: () => [FieldKey, FieldValue][]
    clone: () => headers
}
export type trailers = headers | { tag: "none" }

export interface Pollable {
    read: () => boolean
    block: () => void
}

export interface InputStream {
    read: (len: number) => Uint8Array
    blockingRead: (len: number) => Uint8Array
    skip: (len: number) => Uint8Array
    blockingSkip: (len: number) => Uint8Array
    subscribe: () => Pollable
}

export interface FutureTrailers {
    subscribe: () => Pollable
    get: () => trailers | null
}

export declare class IncomingBody {
    stream: () => InputStream
    static finish: (incomingBody: IncomingBody) => FutureTrailers
}

export interface OutputStream {
    checkWrite: () => bigint
    write: (content: Uint8Array) => void
    blockingWriteAndFlush: (content: Uint8Array) => void
    flush: () => void
    blockingFlush: () => void
    subscribe: () => Pollable
    writeZeros: (len: number) => void
    blockingWriteZerosAndFlush: (len: number) => void
    splice: (src: InputStream, len: number) => number
    blockingSplice: (src: InputStream, len: number) => number
    [Symbol.dispose](): void
}

export declare class OutgoingBody {
    write: () => OutputStream
    static finish: (outgoingBody: OutgoingBody, trailers: trailers | null) => void
}

export interface IncomingRequest {
    method: () => method;

    /// Returns the path with query parameters from the request, as a string.
    pathWithQuery: () => string | null;

    /// Returns the protocol scheme from the request.
    scheme: () => scheme;

    /// Returns the authority from the request, if it was present.
    authority: () => string;

    /// Get the `headers` associated with the request.
    ///
    /// The returned `headers` resource is immutable: `set`, `append`, and
    /// `delete` operations will fail with `header-error.immutable`.
    ///
    /// The `headers` returned are a child resource: it must be dropped before
    /// the parent `incoming-request` is dropped. Dropping this
    /// `incoming-request` before all children are dropped will trap.
    headers: () => headers;

    /// Gives the `incoming-body` associated with this request. Will only
    /// return success at most once, and subsequent calls will return error.
    consume: () => IncomingBody;
}

export declare class OutgoingResponse {
    constructor(headers: headers)
    /// Get the HTTP Status Code for the Response.
    statusCode: () => number;

    /// Set the HTTP Status Code for the Response. Fails if the status-code
    /// given is not a valid http status code.
    setStatusCode: (statusCode: number) => void;

    /// Get the headers associated with the Request.
    ///
    /// The returned `headers` resource is immutable: `set`, `append`, and
    /// `delete` operations will fail with `header-error.immutable`.
    ///
    /// This headers resource is a child: it must be dropped before the parent
    /// `outgoing-request` is dropped, or its ownership is transfered to
    /// another component by e.g. `outgoing-handler.handle`.
    headers: () => headers;

    /// Returns the resource corresponding to the outgoing Body for this Response.
    ///
    /// Returns success on the first call: the `outgoing-body` resource for
    /// this `outgoing-response` can be retrieved at most once. Subsequent
    /// calls will return error.
    body: () => OutgoingBody;
}

export declare class ResponseOutparam {
    static set: (param: ResponseOutparam, response: OutgoingResponse) => void
}