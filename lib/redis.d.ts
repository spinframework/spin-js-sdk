export type payload = Uint8Array;
export type redisParameter = number | Uint8Array;
export type redisResult = number | Uint8Array | null | string;
export interface RedisConnection {
    publish: (channel: string, payload: payload) => void;
    get: (key: string) => payload | null;
    set: (key: string, value: payload) => void;
    incr: (key: string) => number;
    del: (key: string) => number;
    sadd: (key: string, value: string[]) => number;
    smembers: (key: string) => string[];
    srem: (key: string, value: string[]) => number;
    execute: (command: string, args: redisParameter[]) => redisResult[];
}
export declare function open(address: string): RedisConnection;
