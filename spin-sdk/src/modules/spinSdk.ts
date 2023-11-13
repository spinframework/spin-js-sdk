import { router, routerType } from "./router"
import { utils } from "./utils"

interface SpinConfig {
    /**
     * Returns the value of the given config key
     * 
     * @param arg0 - The name of the key
     * @returns - A value string for the given key
     */
    get(arg0: string): string
}

interface KvStore {
    /**
     * Delete the key
     * 
     * @param key - The name of the key
     */
    delete: (key: string) => void
    /**
     * Checks if the key exists
     * 
     * @param key - The name of the key
     * @returns - A boolean
     */
    exists: (key: string) => boolean
    /**
     * Gets the value of the key
     * 
     * @param key - The name of the key
     * @returns - Either null or  an ArrayBuffer
     */
    get: (key: string) => ArrayBuffer | null
    /**
     * Gets the value of the key
     * 
     * @param key - The name of the key
     * @returns - any
    */
    getJson: (key: string) => any
    /**
     * Gets the list of keys
     * 
     * @returns - An array of strings
   */
    getKeys: () => Array<string>
    /**
     * Sets the value for the given key
     * 
     * @param key - The name of the key
     * @param value - The value to be set
    */
    set: (key: string, value: ArrayBuffer | string) => void
    /**
     * Sets the value for the given key after running a json.stringify
     * 
     * @param key - The name of the key
     * @param value - The value to be set
    */
    setJson: (key: string, value: any) => void
}

type SqliteParam = number | string | ArrayBuffer
type SqliteValue = null | number | string | ArrayBuffer


type SqliteRow = Record<string, SqliteValue>
interface SqliteReturn {
    columns: string[],
    rows: SqliteRow[]
}

interface SqliteStore {
    execute: (query: string, params: SqliteParam[]) => SqliteReturn
}

type RdbmsParam = null | boolean | string | number | ArrayBuffer

interface RdbmsReturn {
    columns: string[],
    rows: [
        [RdbmsParam]
    ]
}

interface InferencingOptions {
    maxTokens?: number,
    repeatPenalty?: number,
    repeatPenaltyLastNTokenCount?: number,
    temperature?: number,
    topK?: number,
    topP?: number
}

interface InternalInferencingOptions {
    max_tokens?: number,
    repeat_penalty?: number,
    repeat_penalty_last_n_token_count?: number,
    temperature?: number,
    top_k?: number,
    top_p?: number
}

interface InferenceUsage {
    promptTokenCount: number,
    generatedTokenCount: number
}
interface InferenceResult {
    text: string
    usage: InferenceUsage
}

interface EmbeddingUsage {
    promptTokenCount: number
}

interface EmbeddingResult {
    embeddings: Array<Array<number>>
    usage: EmbeddingUsage
}

/** @deprecated*/
interface SpinSdk {
    utils: {
        toBuffer: (arg0: ArrayBufferView) => Buffer
    }
    Router: () => routerType
    config: SpinConfig
    redis: {
        execute: (address: string, command: string, args: Array<ArrayBuffer | bigint>) => undefined | string | bigint | ArrayBuffer
        get: (address: string, key: string) => ArrayBuffer
        incr: (address: string, key: string) => bigint
        publish: (address: string, channel: string, value: ArrayBuffer) => undefined
        set: (address: string, key: string, value: ArrayBuffer) => undefined
        del: (address: string, key: Array<string>) => bigint
        sadd: (address: string, key: string, values: Array<string>) => bigint
        smembers: (address: string, key: string) => Array<string>
        srem: (address: string, key: string, values: Array<string>) => bigint
    }
    /**
     * Object that allows access to the Spin Key-Value Store 
     */
    kv: {
        /**
         * 
         * @param name - The name of the KV store to open
         * @returns A KV store handle
         */
        open: (name: string) => KvStore
        /**
         * @returns The handle to the default KV store
         */
        openDefault: () => KvStore
    }
    mysql: {
        execute: (address: string, statement: string, params: RdbmsParam[]) => void
        query: (address: string, statement: string, params: RdbmsParam[]) => RdbmsReturn
    }
    pg: {
        execute: (address: string, statement: string, params: RdbmsParam[]) => void
        query: (address: string, statement: string, params: RdbmsParam[]) => RdbmsReturn
    }
    sqlite: {
        open: (name: string) => SqliteStore
        openDefault: () => SqliteStore
    }
    llm: {
        infer: (model: InferencingModels | string, prompt: string) => InferenceResult
        inferWithOptions: (model: InferencingModels | string, prompt: string, options: InternalInferencingOptions) => InferenceResult
        generateEmbeddings: (model: EmbeddingModels | string, sentences: Array<string>) => EmbeddingResult
    }
}

interface HttpResponse {
    status: number
    headers?: Record<string, string>
    body?: ArrayBuffer | string | Uint8Array
}

function encodeBody(body: ArrayBuffer | Uint8Array | string) {
    if (typeof (body) == "string") {
        return new TextEncoder().encode(body).buffer
    } else if (ArrayBuffer.isView(body)) {
        return body.buffer
    } else {
        return body
    }
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

declare global {
    const __internal__: {
        spin_sdk: SpinSdk
    }
}

const kv = {
    /**
     * 
     * @param name - The name of the KV store to open
     * @returns A KV store handle
    */
    open: (name: string) => {
        let store = __internal__.spin_sdk.kv.open(name)
        store.getJson = (key: string) => {
            let val = store.get(key)
            if (val) {
                return JSON.parse(new TextDecoder().decode(val))
            } else {
                return null
            }
        }
        store.setJson = (key: string, value: any) => {
            store.set(key, JSON.stringify(value))
        }
        return store
    },
    /**
     * 
     * @returns A KV store handle to the default store
    */
    openDefault: () => {
        let store = kv.open("default")
        return store
    }

}

/**  features
 */
/** @deprecated */
const spinSdk: SpinSdk = {
    config: __internal__.spin_sdk.config,
    redis: __internal__.spin_sdk.redis,
    kv: kv,
    mysql: __internal__.spin_sdk.mysql,
    pg: __internal__.spin_sdk.pg,
    sqlite: __internal__.spin_sdk.sqlite,
    llm: __internal__.spin_sdk.llm,
    utils: utils,
    Router: () => {
        return router()
    }
}

enum InferencingModels {
    Llama2Chat = "llama2-chat",
    CodellamaInstruct = "codellama-instruct"
}

enum EmbeddingModels {
    AllMiniLmL6V2 = "all-minilm-l6-v2"
}

const Llm = {
    infer: (model: InferencingModels | string, prompt: string, options?: InferencingOptions): InferenceResult => {
        if (!options) {
            return __internal__.spin_sdk.llm.infer(model, prompt)
        }
        let inference_options: InternalInferencingOptions = {
            max_tokens: options.maxTokens || 100,
            repeat_penalty: options.repeatPenalty || 1.1,
            repeat_penalty_last_n_token_count: options.repeatPenaltyLastNTokenCount || 64,
            temperature: options.temperature || 0.8,
            top_k: options.topK || 40,
            top_p: options.topP || 0.9
        }
        return __internal__.spin_sdk.llm.inferWithOptions(model, prompt, inference_options)
    },
    generateEmbeddings: (model: EmbeddingModels | string, text: Array<string>): EmbeddingResult => {
        return __internal__.spin_sdk.llm.generateEmbeddings(model, text)
    }
}
/**
 * Module to allow access to Spin Config
 */
const Config = __internal__.spin_sdk.config
const Redis = __internal__.spin_sdk.redis
const Kv = kv
const Mysql = __internal__.spin_sdk.mysql
const Pg = __internal__.spin_sdk.pg
const Sqlite = __internal__.spin_sdk.sqlite
// const Llm = __internal__.spin_sdk.llm

export { spinSdk, SpinSdk }
export { Config, Redis, Kv, router, Mysql, Pg, Sqlite, Llm, InferencingModels, EmbeddingModels, InferencingOptions, ResponseBuilder }
