import { HandleRequest, HttpRequest, HttpResponse, Config } from "@fermyon/spin-sdk"

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {

    const physicsFact = await fetch("https://random-data-api.fermyon.app/physics/json")

    const physicsFactBody = await physicsFact.text()

    const env = JSON.stringify(process.env)

    const body = `${Config.get("message")}\nenv: ${env}\nHere's a physics fact: ${physicsFactBody}\n`

    return {
        status: 200,
        headers: { "foo": "bar" },
        body: encoder.encode(body).buffer
    }
}
