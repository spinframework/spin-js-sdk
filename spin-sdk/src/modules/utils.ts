import  arrayBuftoBuf from "typedarray-to-buffer"
import { Buffer } from "buffer"

const utils = {
    toBuffer(arg0: ArrayBufferView): Buffer {
        return arrayBuftoBuf(arg0)
    },
}

export {utils}