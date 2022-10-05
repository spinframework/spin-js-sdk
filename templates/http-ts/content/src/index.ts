import {HttpRequest, SpinSDK} from "./SpinSDK"

declare const spinSdk: SpinSDK;

const encoder = new TextEncoder()

export async function handleRequest(request: HttpRequest) {

    return {
        status: 200,
        headers: { "foo": "bar" },
        body: encoder.encode("Hello from JS-SDK").buffer
    }
}
