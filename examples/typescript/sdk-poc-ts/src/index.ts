import { HandleRequest, HttpRequest, HttpResponse, spinSdk } from "test"

//@ts-ignore
const encoder = new TextEncoder()

let router  = spinSdk.Router()

router.get("/", () => console.log("got root"))
router.get("/home", () => console.log("got home"))

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {
    await router.handleRequest(request)
    
    console.log("The config is ", spinSdk.config.get("test"))

    return {
        status: 200,
        headers: {"foo": "bar"},
        body: encoder.encode("Hello from TS-SDK").buffer
    }
}
