import { HttpResponse } from "spin-sdk"

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function health(): HttpResponse {
    return {
        status: 200,
        body: encoder.encode("Server is healthy").buffer
    }
}

function headersTest(): HttpResponse {
    return {
        status: 200,
        headers: { "content-type": "text/html" },
        body: encoder.encode("Hello from JS SDK").buffer
    }
}

async function outboundHttp(): Promise<HttpResponse> {
    let requestUrl = "http://localhost:3000/health"
    let response = await fetch(requestUrl)
    if (response.status == 200) {
        if (await response.text() == "Server is healthy") {
            return {
                status: 200,
                body: encoder.encode("success").buffer
            }
        }
    }
    return { status: 500 }
}

async function fileRead(): Promise<HttpResponse> {
    let fileContent = await fsPromises.readFile("./test_file.txt")
    let text = decoder.decode(new Uint8Array(fileContent))

    if (text == "This file exercises file reads") {

        return {
            status: 200,
            body: encoder.encode("success").buffer
        }
    } else {
        return { status: 500 }
    }
}

async function dirRead(): Promise<HttpResponse> {
    let fileContent = await fsPromises.readdir("./")
    if (fileContent.length > 0) {
        return {
            status: 200,
            body: encoder.encode("success").buffer
        }
    } else {
        return { status: 500 }
    }
}

async function testFunctionality(): Promise<HttpResponse> {
    let testArray = ["headersTest", "outboundHttp", "fileRead", "dirRead"]
    let testResult: Record<string, boolean> = {}
    await testArray.map(async (k) => {
        let res = await fetch("http://localhost:3000/" + k)
        if (k == "headersTest") {
            if (res.status == 200 && res.headers.get("content-type") == "text/html") {
                testResult[k] = true
            } else {
                testResult[k] = false
            }
        } else {
            if (res.status == 200) {
                testResult[k] = true
            } else {
                testResult[k] = false
            }
        }
    })
    if (Object.keys(testResult).some(k => {
        return !testResult[k]
    })) {
        console.log(JSON.stringify(testResult, null, 2))
        return {
            status: 500
        }
    } else {
        return {
            status: 200,
            body: encoder.encode(JSON.stringify(testResult, null, 2)).buffer
        }
    }
}

export {
    health,
    headersTest,
    outboundHttp,
    fileRead,
    dirRead,
    testFunctionality
}