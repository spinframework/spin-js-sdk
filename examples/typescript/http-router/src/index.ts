import { HandleRequest, HttpRequest, HttpResponse, Router } from "@fermyon/spin-sdk"
import { withCorrelationId } from "./middlewares"

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const router = Router()

// register a simple inline handler 
router.get("/ok", () => ({ status: 200 }))
// use route parameters
router.get("/echo/:value?", ({ params }) => echo(params.value))
// register routes for different HTTP methods
router.post("/format-json", ({ }, body) => formatJson(body))
// use middlewares
router.post("/start-job", withCorrelationId, ({ correlationId }) => startJob(correlationId))
// catch all route to send 404 for all other requests
router.all("*", () => ({
    status: 404,
    body: encoder.encode("Not found")
}))

function echo(value?: string): HttpResponse {
    if (!value) {
        return {
            status: 204
        }
    }
    return {
        status: 200,
        body: value
    }
}

function formatJson(body: ArrayBuffer): HttpResponse {
    try {
        console.log(body)
        const json = JSON.parse(decoder.decode(body))
        return {
            status: 200,
            body: encoder.encode(JSON.stringify(json, null, 2))
        }
    } catch (e) {
        return {
            status: 400,
            body: encoder.encode("Invalid JSON provided, sorry!")
        }
    }
}

function startJob(correlationId: string): HttpResponse {
    const job = {
        name: "Sample Job",
        status: "started",
        correlationId,
    }
    return {
        status: 200,
        body: encoder.encode(JSON.stringify(job))
    }
}

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {
    return router.handleRequest(request, request.body)
}
