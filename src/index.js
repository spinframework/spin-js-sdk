require('fast-text-encoding')

const encoder = new TextEncoder("utf-8")
const decoder = new TextDecoder("utf-8")

export async function handleRequest(request) {
    const dogFact = await fetch("https://some-random-api.ml/facts/dog")

    const dogFactBody = decoder.decode(await dogFact.arrayBuffer() || new Uint8Array())

    return {
        status: 200,
        headers: { "foo": "bar" },
        body: encoder.encode(`${spinSdk.config.get("message")}\nHere's a dog fact: ${dogFactBody}\n`).buffer
    }
}
