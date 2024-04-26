import { HandleRequest, HttpRequest, HttpResponse, Config } from "@fermyon/spin-sdk"

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {

    const physicsFact = await fetch("https://random-data-api.fermyon.app/physics/json")
  
    const physicsFactBody = await physicsFact.text()

    const physicsFactObject = JSON.parse(physicsFactBody)

    const body = `Here's a physics fact: ${JSON.parse(physicsFactBody).fact}\n`
    
    return {
        status: 200,
        headers: { "foo": "bar" },
        body: encoder.encode(body).buffer
    }
}
