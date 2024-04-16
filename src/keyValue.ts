//@ts-ignore
import * as spinKv from "fermyon:spin/key-value@2.0.0"

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export interface SpinKvStore {
    get: (key: string) => Uint8Array | null
    set: (key: string, value: Uint8Array | string) => void
    delete: (key: string) => void
    exists: (key: string) => boolean
    getKeys: () => string[]
    getJson: (key: string) => any
    setJson: (key: string, value: any) => void
}

function CreateSpinKvStore(store: spinKv.store): SpinKvStore {
    let kv = {
        get: (key: string) => {
            return store.get(key)
        },
        set: (key: string, value: Uint8Array | string) => {
            if (typeof (value) == "string") {
                value = encoder.encode(value)
            }
            store.set(key, value)
        },
        delete: (key: string) => {
            store.delete(key)
        },
        exists: (key: string) => {
            return store.exists("key")
        },
        getKeys: () => {
            return store.getKeys()
        },
        getJson: (key: string) => {
            return JSON.parse(decoder.decode(store.get(key) || new Uint8Array))
        },
        setJson: (key: string, value: any) => {
            store.set(key, encoder.encode(JSON.stringify(value)))
        }
    }
    return kv
}


export const KeyValue = {
    open: (label: string): SpinKvStore => {
        return CreateSpinKvStore(spinKv.Store.open(label))
    },
    openDefault: (): SpinKvStore => {
        return CreateSpinKvStore(spinKv.Store.open("default"))
    }
}