/// <reference types="node" />
import { routerType } from "./router";
import { Buffer } from "buffer";
interface SpinConfig {
    get(arg0: string): string;
}
interface KvStore {
    delete: (key: string) => void;
    exists: (key: string) => boolean;
    get: (key: string) => ArrayBuffer | null;
    getKeys: () => Array<string>;
    set: (key: string, value: ArrayBuffer | string) => void;
}
interface SpinSDK {
    utils: {
        toBuffer: (arg0: ArrayBufferView) => Buffer;
    };
    Router: () => routerType;
    config: SpinConfig;
    redis: {
        execute: (address: string, command: string, args: Array<ArrayBuffer | bigint>) => undefined | string | bigint | ArrayBuffer;
        get: (address: string, key: string) => ArrayBuffer;
        incr: (address: string, key: string) => bigint;
        publish: (address: string, channel: string, value: ArrayBuffer) => undefined;
        set: (address: string, key: string, value: ArrayBuffer) => undefined;
        del: (address: string, key: Array<string>) => bigint;
        sadd: (address: string, key: string, values: Array<string>) => bigint;
        smembers: (address: string, key: string) => Array<string>;
        srem: (address: string, key: string, values: Array<string>) => bigint;
    };
    kv: {
        open: (name: string) => KvStore;
        openDefault: () => KvStore;
    };
}
declare global {
    const __internal__: {
        spin_sdk: SpinSDK;
    };
}
declare const spinSdk: SpinSDK;
export { spinSdk };
