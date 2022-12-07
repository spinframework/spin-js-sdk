import { HandleRequest, HttpRequest, HttpResponse } from "@fermyon/spin-sdk"

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const redisAddress = "redis://localhost:6379/"

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {

    spinSdk.redis.incr(redisAddress, "test")
    spinSdk.redis.incr(redisAddress, "test")

    console.log(decoder.decode(new Uint8Array(spinSdk.redis.get(redisAddress, "test"))))

    spinSdk.redis.set(redisAddress, "test-set", encoder.encode("This is a test").buffer)

    console.log(decoder.decode(new Uint8Array(spinSdk.redis.get(redisAddress, "test-set"))))

    spinSdk.redis.publish(redisAddress, "test", encoder.encode("This is a test").buffer)

    return {
        status: 200,
        headers: {"foo": "bar"},
        body: encoder.encode("Hello from JS-SDK").buffer
    }
}
