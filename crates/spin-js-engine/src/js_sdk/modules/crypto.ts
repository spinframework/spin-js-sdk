require('fast-text-encoding')

let encoder = new TextEncoder()

/** @internal */
declare var _random: {
    math_rand: () => number
    get_rand: () => number
    get_hash: (algorithm: string, content: ArrayBuffer) => ArrayBuffer
    get_hmac: (algorithm: string, key: ArrayBuffer, content: ArrayBuffer) => ArrayBuffer
    timing_safe_equals: (value1: ArrayBuffer, value2: ArrayBuffer) => boolean
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
        },
        verify: function(algorithm: string, key: ArrayBuffer, signature: ArrayBuffer, data: ArrayBuffer): boolean {
            return crypto.verify(algorithm, data, key, signature)
        }
    },
    createHash: function (algorithm: string) {
        let data = new Uint8Array()
        return {
            update(content: string | Uint8Array, inputEncoding: string = "utf8") {
                if (typeof (content) == "string") {
                    if (inputEncoding == "utf8") {
                        content = encoder.encode(content)
                    } else {
                        throw new Error("Currently only utf8 strings are supported")
                    }
                }
                let mergedArray = new Uint8Array(data.length + content.length);
                mergedArray.set(data);
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
    },
    createHmac: function (algorithm: string, key: ArrayBuffer) {
        let data = new Uint8Array()
        return {
            update(content: string | Uint8Array, inputEncoding: string = "utf8") {
                if (typeof (content) == "string") {
                    if (inputEncoding == "utf8") {
                        content = encoder.encode(content)
                    } else {
                        throw new Error("Currently only utf8 strings are supported")
                    }
                }
                let mergedArray = new Uint8Array(data.length + content.length);
                mergedArray.set(data);
                mergedArray.set(content, data.length);
                data = mergedArray
            },
            digest() {
                if (algorithm == "sha256") {
                    return _random.get_hmac("sha256", key, data.buffer)
                } else if (algorithm == "sha512") {
                    return _random.get_hmac("sha512", key, data.buffer)
                } else
                    throw new Error("sha256 and sha512 are the only supported algorithms");
            }
        }
    },
    timingSafeEqual: function(value1: ArrayBuffer, value2: ArrayBuffer): boolean {
        if (value1.byteLength != value2.byteLength) {
            throw new Error("buffers must be of the same length")
        } 
        return _random.timing_safe_equals(value1, value2)
    },
    verify: function(algorithm: string, data: ArrayBuffer, key: ArrayBuffer, signature: ArrayBuffer): boolean {
        if (algorithm != "HMAC") {
            throw new Error("only HMAC is currently supported")
        }
        let hmac = _random.get_hmac("sha256", key, data)
        if (hmac.byteLength != signature.byteLength) {
            return false
        }
        return crypto.timingSafeEqual(hmac, signature)
    }
}
