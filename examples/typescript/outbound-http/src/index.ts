import {HandleRequest, HttpResponse} from "spin-sdk-types"

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export const handleRequest: HandleRequest = async function(request): Promise<HttpResponse> {
    console.log(request.text())
    const dogFact = await fetch("https://some-random-api.ml/facts/dog")

    const dogFactBody = await dogFact.text()

    const env = JSON.stringify(process.env)

    const body = `${spinSdk.config.get("message")}\nenv: ${env}\nHere's a dog fact: ${dogFactBody}\n`

    return {
        status: 200,
        headers: new Map([[ "foo", "bar" ]]),
        body: encoder.encode(body).buffer
    }
}
