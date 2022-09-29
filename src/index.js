const encoder = new TextEncoder("utf-8")
const decoder = new TextDecoder("utf-8")

export async function handleRequest(request) {
    const dogFact = await fetch("https://some-random-api.ml/facts/dog")

    const dogFactBody = decoder.decode(await dogFact.arrayBuffer() || new Uint8Array())

    const env = JSON.stringify(process.env)

    const body = `${spinSdk.config.get("message")}\nenv: ${env}\nHere's a dog fact: ${dogFactBody}\n`

    console.log(body)

    let htmlFile = await fsPromises.readFile("./src/index.html")

    return {
        status: 200,
        headers: { "foo": "bar" },
        body: htmlFile
    }
}
