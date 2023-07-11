import { HandleRequest, HttpRequest, HttpResponse, Config } from "@fermyon/spin-sdk"

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {

    const dogFact = await fetch("https://some-random-api.ml/facts/dog")

    const dogFactBody = await dogFact.text()

    const env = JSON.stringify(process.env)

    const body = `${Config.get("message")}\nenv: ${env}\nHere's a dog fact: ${dogFactBody}\n`

    return {
        status: 200,
        headers: { "foo": "bar" },
        body: encoder.encode(body).buffer
    }
}
