import { router, routerType } from "./router"
import { utils } from "./utils"

interface SpinConfig {
    get(arg0: string): string
}

interface KvStore {
    delete: (key: string) => void
    exists: (key: string) => boolean
    get: (key: string) => ArrayBuffer | null
    getJson: (key: string) => any
    getKeys: () => Array<string>
    set: (key: string, value: ArrayBuffer | string) => void
    setJson: (key: string, value: any) => void
}

type SqliteParam = number | string | ArrayBuffer
type SqliteValue = null | number | string | ArrayBuffer

interface SqliteReturn {
    columns: string[],
    rows: [
        [SqliteValue]
    ]
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

interface InferenceOptions {
    max_tokens: number,
    repeat_penalty: number,
    repeat_penalty_last_n_token_count: number,
    temperature: number,
    top_k: number,
    top_p: number
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
        infer: (prompt: string) => string
        inferWithOptions: (prompt: string, options: InferenceOptions) => string
        generatEmbeddings: (sentences: Array<string>) => Array<Array<number>>
    }
}


declare global {
    const __internal__: {
        spin_sdk: SpinSdk
    }
}

const kv = {
    open: (name: string) => {
        let store = __internal__.spin_sdk.kv.open(name)
        store.getJson = (key: string) => {
            return JSON.parse(new TextDecoder().decode(store.get(key)))
        }
        store.setJson = (key: string, value: any) => {
            store.set(key, JSON.stringify(value))
        }
        return store
    },
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

const Config = __internal__.spin_sdk.config
const Redis = __internal__.spin_sdk.redis
const Kv = kv
const Mysql = __internal__.spin_sdk.mysql
const Pg = __internal__.spin_sdk.pg
const Sqlite = __internal__.spin_sdk.sqlite
const Llm = __internal__.spin_sdk.llm

export { spinSdk, SpinSdk }
export { Config, Redis, Kv, router, Mysql, Pg, Sqlite, Llm }
