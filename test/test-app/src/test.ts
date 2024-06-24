import { Kv, ResponseBuilder } from "@fermyon/spin-sdk";

const decoder = new TextDecoder()

function health(req: Request, res: ResponseBuilder) {
    res.status(200)
    res.send("Server is healthy")
}

function statusTest(req: Request, res: ResponseBuilder) {
    res.status(201)
    res.send()
}

function headersTest(req: Request, res: ResponseBuilder) {
    res.set("content-type", "text/html")
    res.send()
}

async function outboundHttp(req: Request, res: ResponseBuilder) {
    let requestUrl = "http://localhost:3000/health"
    let response = await fetch(requestUrl)
    if (response.status == 200) {
        if (await response.text() == "Server is healthy") {
            res.status(200),
                res.send("success")
            return
        }
    }
    res.status(500)
    res.send()
}

async function kvTest(req: Request, res: ResponseBuilder) {
    let store = Kv.openDefault()
    store.set("test", "try")
    decoder.decode(store.get("test") || new Uint8Array()) == "try" ? res.status(200) : res.status(500)
    res.send()
}

async function testFunctionality(req: Request, res: ResponseBuilder) {

    let testArray = ["statusTest", "headersTest", "outboundHttp", "kvTest"]
    let testResult: Record<string, boolean> = {}
    for (const test of testArray) {
        let resp = await fetch(`http://localhost:3000/${test}`)
        // Special casing only for headers and status as we need to check the responses
        if (test == "headersTest") {
            testResult[test] = resp.status == 200 && resp.headers.get("content-type") == "text/html"
        } else if (test == "statusTest") {
            testResult[test] = resp.status == 201
        } else {
            testResult[test] = resp.status == 200
        }
    }
    if (Object.keys(testResult).some(k => {
        return !testResult[k]
    })) {
        res.status(500)
        res.send(JSON.stringify(testResult, null, 2))
        return
    }
    res.status(200)
    res.send(JSON.stringify(testResult, null, 2))
}

export {
    health,
    testFunctionality,
    headersTest,
    statusTest,
    outboundHttp,
    kvTest
}