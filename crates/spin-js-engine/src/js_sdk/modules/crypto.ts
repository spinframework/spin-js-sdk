require('fast-text-encoding')

let encoder = new TextEncoder()

/** @internal */
declare var _random: {
    math_rand: () => number
    get_rand: () => number
    get_hash: (algorithm: string, content: ArrayBuffer) => ArrayBuffer
}

/** @internal */
export const crypto = {
    getRandomValues: function <T extends ArrayBufferView | null>(array: T) {
        if (array) {
            if (array.byteLength > 65536) {
                throw "QuotaExceededError"
            }
            const bytes = Buffer.from(array.buffer)
            for (let i = 0; i < bytes.byteLength; ++i) {
                bytes[i] = _random.get_rand()
            }
        }
        return array
    },
    subtle: {
        digest: function (algorithm: string, content: ArrayBuffer) {
            if (algorithm == "SHA-256") {
                return Promise.resolve(_random.get_hash("sha256", content))
            } else if (algorithm == "SHA-512") {
                return Promise.resolve(_random.get_hash("sha512", content))
            } else {
                throw new Error("SHA-256 and SHA-512 are the only supported algorithms");
            }
        }
    },
    createHash: function (algorithm: string) {
        let data = new Uint8Array()
        return {
            update(content: string | Uint8Array, inputEncoding: string = "string") {
                if (inputEncoding == "string") {
                    // @ts-ignore
                    content = encoder.encode(content)
                }
                let  mergedArray = new Uint8Array(data.length + content.length);
                mergedArray.set(data);
                // @ts-ignore
                mergedArray.set(content, data.length);
                data = mergedArray
            },
            digest() {
                if (algorithm == "sha256") {
                    return _random.get_hash("sha256", data.buffer)
                } else if (algorithm == "sha512") {
                    return _random.get_hash("sha512", data.buffer)
                } else
                    throw new Error("sha256 and sha512 are the only supported algorithms");
            }
        }
    }

}