/** @internal */
const arrayBufToBuf = require('typedarray-to-buffer')

/** @internal */
function toBuffer(arg0: ArrayBuffer): Buffer {
    return arrayBufToBuf(arg0)
}

/** @internal */
const utils = {
    toBuffer(arg0: ArrayBuffer): Buffer {
        return arrayBufToBuf(arg0)
    } 
}

declare global {
    const utils: {
        toBuffer(argo: ArrayBuffer): Buffer
    }
}

/* @internal */
export {utils}