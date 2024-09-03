import { RedisHandler } from "@fermyon/spin-sdk";

const decoder = new TextDecoder();

export class MyRedisHandler extends RedisHandler {
    async handleMessage(msg) {
        console.log("Received message:", decoder.decode(msg));
    }
}

export const inboundRedis = new MyRedisHandler();