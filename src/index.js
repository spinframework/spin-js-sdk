require('fast-text-encoding')

const encoder = new TextEncoder("utf-8")
const decoder = new TextDecoder("utf-8")

export function handleRequest(request) {
    const dogFact = spinSdk.http.send({
        method: "GET",
        uri: "https://some-random-api.ml/facts/dog",
    })

    const dogFactBody = decoder.decode(dogFact.body || new Uint8Array())

    return {
        status: 200,
        headers: [
            ["foo", encoder.encode("bar").buffer]
        ],
        body: encoder.encode(`${spinSdk.config.get("message")}\nHere's a dog fact: ${dogFactBody}\n`).buffer
    }
}
