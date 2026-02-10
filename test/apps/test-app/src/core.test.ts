import { pushStreamChunks, readStreamChunks } from "./helpers";

const decoder = new TextDecoder();
const streamingChunks = ["chunk1", "chunk2", "chunk3", "chunk4", "chunk5"];

/**
 * Health check endpoint
 */
export function health(req: Request) {
    return new Response("Healthy", { status: 200 });
}

/**
 * Stream test endpoint - creates a readable stream with chunks
 */
export function stream(req: Request) {
    const { readable, writable } = new TransformStream();
    pushStreamChunks(writable, streamingChunks);

    return new Response(readable, {
        headers: { 'Content-Type': 'text/plain' },
    });
}

/**
 * Status test - returns 201 status
 */
export function statusTest(req: Request) {
    return new Response(null, { status: 201 });
}

/**
 * Headers test - returns custom content-type header
 */
export function headersTest(req: Request) {
    return new Response(null, { headers: { "content-type": "text/html" } });
}

/**
 * Outbound HTTP test - makes a fetch request to /health endpoint
 */
export async function outboundHttp(req: Request) {
    let requestUrl = "http://localhost:3000/health";
    let response = await fetch(requestUrl);
    if (response.status == 200) {
        if (await response.text() == "Healthy") {
            return new Response("success", { status: 200 });
        }
    }
    return new Response("failed", { status: 500 });
}

/**
 * Stream test - fetches from /stream endpoint and validates chunks
 */
export async function streamTest(req: Request) {
    let response = await fetch("http://localhost:3000/stream");

    if (response.body == null) {
        return new Response("response has no body", { status: 500 });
    }

    let chunks = await readStreamChunks(response.body);

    if (chunks.length != streamingChunks.length) {
        return new Response("chunks length mismatch", { status: 500 });
    }

    for (let i = 0; i < chunks.length; i++) {
        if (chunks[i] != streamingChunks[i]) {
            return new Response("chunks mismatch", { status: 500 });
        }
    }

    return new Response("success", { status: 200 });
}

/**
 * URL query params test - tests URL query parameter handling
 */
export async function queryParamsTest(req: Request) {
    try {
        // Test SDK functionality: make a request with query parameters
        const response = await fetch("http://localhost:3000/health?param1=value1&param2=value2");
        
        // The test verifies the SDK can handle URLs with query parameters
        if (response.ok) {
            return new Response("success", { status: 200 });
        }
        return new Response(`failed: response not ok`, { status: 500 });
    } catch (error: any) {
        return new Response(`failed: ${error.message || error}`, { status: 500 });
    }
}
