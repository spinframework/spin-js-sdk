import { HandleRequest, HttpResponse} from "@fermyon/spin-sdk"

const encoder = new TextEncoder()

export const handleRequest: HandleRequest = async function(request): Promise<HttpResponse> {
    return {
      status: 200,
        headers: { "foo": "bar" },
      body: encoder.encode("Hello from TS-SDK").buffer
    }
}
