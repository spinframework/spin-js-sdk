import {spinSdk, fetch, HandleRequest, HttpResponse} from "spin-sdk-types"

const encoder = new TextEncoder()

export const handleRequest: HandleRequest = async function(request): Promise<HttpResponse> {
    return {
      status: 200,
      headers: new Map([[ "foo", "bar" ]]),
      body: encoder.encode("Hello from JS-SDK").buffer
    }
}
