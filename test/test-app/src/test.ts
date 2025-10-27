import * as Kv from "@spinframework/spin-kv";
import { pushStreamChunks, isEqualBytes, readStreamChunks } from "./helpers";

const decoder = new TextDecoder()
const streamingChunks = ["chunk1", "chunk2", "chunk3", "chunk4", "chunk5"]

function health(req: Request) {
    return new Response("Healthy", { status: 200 })
}

function stream(req: Request) {
    const { readable, writable } = new TransformStream();
    pushStreamChunks(writable, streamingChunks)

    // Return the stream as a Response
    return new Response(readable, {
        headers: { 'Content-Type': 'text/plain' },
    })
}

function statusTest(req: Request) {
    return new Response(null, { status: 201 })
}

function headersTest(req: Request) {
    return new Response(null, { headers: { "content-type": "text/html" } })
}

async function outboundHttp(req: Request) {
    let requestUrl = "http://localhost:3000/health"
    let response = await fetch(requestUrl)
    if (response.status == 200) {
        if (await response.text() == "Healthy") {
            return new Response("success", { status: 200 })
        }
    }
    return new Response("failed", { status: 500 })
}

function kvTest(req: Request) {
    let store = Kv.openDefault()
    store.set("test", "try")
    if (decoder.decode(store.get("test") || new Uint8Array()) == "try") {
        return new Response("success", { status: 200 })
    }
    return new Response("failed", { status: 500 })
}

function kvTestArrayBuffer(req: Request) {
    let store = Kv.openDefault()

    let arr = new Uint8Array([1, 2, 3])
    store.set("arr", arr.buffer)
    let ret = store.get("arr")
    if (ret == null || !isEqualBytes(new Uint8Array(ret), arr)) {
        return new Response("failed", { status: 500 })
    }
    return new Response("success", { status: 200 })
}

function kvTestUint8Array(req: Request) {
    let store = Kv.openDefault()

    let arr = new Uint8Array([1, 2, 3])
    store.set("arr", arr)
    let ret = store.get("arr")

    if (ret == null || !isEqualBytes(ret, arr)) {
        return new Response("failed", { status: 500 })
    }
    return new Response("success", { status: 200 })
}

async function streamTest(req: Request) {
    let response = await fetch("http://localhost:3000/stream")

    if (response.body == null) {
        return new Response("response has no body", { status: 500 })
    }

    let chunks = await readStreamChunks(response.body)

    if (chunks.length != streamingChunks.length) {
        return new Response("chunks length mismatch", { status: 500 })
    }

    for (let i = 0; i < chunks.length; i++) {
        if (chunks[i] != streamingChunks[i]) {
            return new Response("chunks mismatch", { status: 500 })
        }
    }

    return new Response("success", { status: 200 })
}

async function testFunctionality(req: Request) {
    const testCases = [
        { name: "statusTest", validate: (resp: Response) => resp.status === 201 },
        { name: "headersTest", validate: (resp: Response) => resp.status === 200 && resp.headers.get("Content-Type") === "text/html" },
        { name: "outboundHttp", validate: (resp: Response) => resp.status === 200 },
        { name: "kvTest", validate: (resp: Response) => resp.status === 200 },
        { name: "kvTestArrayBuffer", validate: (resp: Response) => resp.status === 200 },
        { name: "kvTestUint8Array", validate: (resp: Response) => resp.status === 200 },
        { name: "streamTest", validate: (resp: Response) => resp.status === 200 },
    ];

    const results: { [key: string]: boolean } = {};

    for (const test of testCases) {
        const resp = await fetch(`http://localhost:3000/${test.name}`);
        results[test.name] = test.validate(resp);
    }

    const allPassed = Object.values(results).every(Boolean);
    let status = allPassed ? 200 : 500;
    return new Response(JSON.stringify(results, null, 2), { status });
}


export {
    health,
    stream,
    testFunctionality,
    headersTest,
    statusTest,
    outboundHttp,
    kvTest,
    kvTestArrayBuffer,
    kvTestUint8Array,
    streamTest
}