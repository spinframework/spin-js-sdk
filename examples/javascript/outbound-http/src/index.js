const encoder = new TextEncoder("utf-8")
const decoder = new TextDecoder("utf-8")

export async function handleRequest(request) {
    const physicsFact = await fetch("https://random-data-api.fermyon.app/physics/json")

    const physicsFactBody = decoder.decode(await physicsFact.arrayBuffer() || new Uint8Array())

    const env = JSON.stringify(process.env)

    const body = `Here's a physics fact: ${physicsFactBody}\n`

    return {
        status: 200,
        headers: { "foo": "bar" },
        body: encoder.encode(body).buffer
    }
}
