//@ts-ignore
import * as spinKv from "fermyon:spin/key-value@2.0.0";
const encoder = new TextEncoder();
const decoder = new TextDecoder();
function CreateSpinKvStore(store) {
    let kv = {
        get: (key) => {
            return store.get(key);
        },
        set: (key, value) => {
            if (typeof (value) == "string") {
                value = encoder.encode(value);
            }
            store.set(key, value);
        },
        delete: (key) => {
            store.delete(key);
        },
        exists: (key) => {
            return store.exists(key);
        },
        getKeys: () => {
            return store.getKeys();
        },
        getJson: (key) => {
            return JSON.parse(decoder.decode(store.get(key) || new Uint8Array));
        },
        setJson: (key, value) => {
            store.set(key, encoder.encode(JSON.stringify(value)));
        }
    };
    return kv;
}
export const KeyValue = {
    open: (label) => {
        return CreateSpinKvStore(spinKv.Store.open(label));
    },
    openDefault: () => {
        return CreateSpinKvStore(spinKv.Store.open("default"));
    }
};
