//@ts-ignore
import * as spinKv from 'fermyon:spin/key-value@2.0.0';
const encoder = new TextEncoder();
const decoder = new TextDecoder();
function createKvStore(store) {
    let kv = {
        get: (key) => {
            return store.get(key);
        },
        set: (key, value) => {
            if (typeof value === 'string') {
                value = encoder.encode(value);
            }
            else if (typeof value === 'object') {
                value = encoder.encode(JSON.stringify(value));
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
            return JSON.parse(decoder.decode(store.get(key) || new Uint8Array()));
        },
        setJson: (key, value) => {
            store.set(key, encoder.encode(JSON.stringify(value)));
        },
    };
    return kv;
}
export function open(label) {
    return createKvStore(spinKv.Store.open(label));
}
export function openDefault() {
    return createKvStore(spinKv.Store.open('default'));
}
