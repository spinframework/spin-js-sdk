import { RedisHandler } from "@fermyon/spin-sdk";

export class MyRedisHandler extends RedisHandler {
    async handleMessage(msg: Uint8Array): Promise<void> {
        console.log("Received message:", msg);
    }
}

export const inboundRedis = new MyRedisHandler()