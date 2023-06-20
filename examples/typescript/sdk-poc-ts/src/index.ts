import { HandleRequest, HttpRequest, HttpResponse, spinSdk, Router, Redis, Config } from "spin-sdk"

const decoder = new TextDecoder()

let a  = Router()

a.get("/", () => console.log("got root"))
a.get("/home", () => console.log("got home"))

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {
    await a.handleRequest(request)
    
    let val = Redis.get("redis://localhost:6379/", "test")
    console.log("redis value is ", decoder.decode(new Uint8Array(val)))

    const dogFact = await fetch("https://random-data-api.fermyon.app/animals/json")
    console.log(await dogFact.text())

    console.log("The config is ", Config.get("test"))

    return {
        status: 200,
        headers: {"foo": "bar"},
        body: "Hello from TS-SDK"
    }
}
