const decoder = new TextDecoder();
const encoder = new TextEncoder();

export function isEqualBytes(
    bytes1: Uint8Array,
    bytes2: Uint8Array

): boolean {

    if (bytes1.length !== bytes2.length) {
        return false;
    }

    for (let i = 0; i < bytes1.length; i++) {
        if (bytes1[i] !== bytes2[i]) {
            return false;
        }
    }

    return true;

}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function readStreamChunks(stream: ReadableStream) {
    const reader = stream.getReader();
    const chunks = [];

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(decoder.decode(value));
    }

    return chunks;
}

export async function pushStreamChunks(stream: WritableStream<any>, chunks: string[]) {
    const writer = stream.getWriter();

    for (const chunk of chunks) {
        await writer.write(encoder.encode(chunk));
        await sleep(20);
    }

    writer.close();
}