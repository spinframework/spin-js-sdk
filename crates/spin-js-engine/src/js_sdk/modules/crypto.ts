/** @internal */
declare var _random: {
    math_rand: () => number
    get_rand: () => number
}

/** @internal */
export const crypto = {
    getRandomValues: function <T extends ArrayBufferView | null>(array: T) {
        if (array) {
            if(array.byteLength > 65536) {
                throw "QuotaExceededError"
            }
            const bytes = Buffer.from(array.buffer)
            for (let i = 0; i < bytes.byteLength; ++i) {
                bytes[i] = _random.get_rand()
            }
        }
        return array
    }
}