export abstract class RedisHandler {
    abstract handleMessage(msg: Uint8Array): Promise<void>;
}
