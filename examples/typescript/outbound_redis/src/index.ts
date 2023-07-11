import { HandleRequest, HttpRequest, HttpResponse, Redis } from "@fermyon/spin-sdk"

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const redisAddress = "redis://localhost:6379/"

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {

    Redis.incr(redisAddress, "test")
    Redis.incr(redisAddress, "test")

    console.log(decoder.decode(new Uint8Array(Redis.get(redisAddress, "test"))))

    Redis.set(redisAddress, "test-set", encoder.encode("This is a test").buffer)

    console.log(decoder.decode(new Uint8Array(Redis.get(redisAddress, "test-set"))))

    Redis.publish(redisAddress, "test", encoder.encode("This is a test").buffer)

    return {
        status: 200,
        headers: {"foo": "bar"},
        body: encoder.encode("Hello from JS-SDK").buffer
    }
}
