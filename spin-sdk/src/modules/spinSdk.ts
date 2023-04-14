import { router, routerType } from "./router"
import { utils } from "./utils"

interface SpinConfig {
    get(arg0: string): string
}

interface KvStore {
    delete: (key: string) => void
    exists: (key: string) => boolean
    get: (key: string) => ArrayBuffer | null
    getKeys: () => Array<string>
    set: (key: string, value: ArrayBuffer | string) => void
}

/**
 * The SpinSdk interface provides access to all the spin defined function and more
 * It has methods to access databases like redis, kv
 * It also provides utility functions and a router
 */
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
}


declare global {
    const __internal__: {
        spin_sdk: SpinSdk
    }
}


/**
 * Sdk module that provides access to spin features
 */
const spinSdk: SpinSdk = __internal__.spin_sdk
spinSdk.utils = utils
spinSdk.Router =  () => {
    return router()
}

export { spinSdk, SpinSdk }