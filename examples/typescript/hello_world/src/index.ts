import { HttpRequest } from "spin-sdk-types"

const encoder = new TextEncoder()

export async function handleRequest(_request: HttpRequest) {

    return {
        status: 200,
        headers: { "foo": "bar" },
        body: encoder.encode("Hello from JS-SDK").buffer
    }
}
