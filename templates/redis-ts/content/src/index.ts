import { RedisHandler } from "@spinframework/spin-trigger-redis";

const decoder = new TextDecoder();

export class MyRedisHandler extends RedisHandler {
    async handleMessage(msg: Uint8Array): Promise<void> {
        console.log("Received message:", decoder.decode(msg));
    }
}

export const inboundRedis = new MyRedisHandler()