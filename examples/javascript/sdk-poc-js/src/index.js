import {spinSdk} from "spin-sdk-poc"

const encoder = new TextEncoder("utf-8")

let router = spinSdk.Router()

router.get("/", () => console.log("got root"))
router.get("/home", () => console.log("got home"))

export async function handleRequest(request) {

    await router.handleRequest(request)

    console.log("The config is ", spinSdk.config.get("test"))

    return {
        status: 200,
        headers: {"foo": "bar"},
        body: encoder.encode("Hello from JS-SDK").buffer
    }
}
