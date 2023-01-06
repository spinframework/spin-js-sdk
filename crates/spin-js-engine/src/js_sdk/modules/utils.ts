/** @internal */
const arrayBufToBuf = require('typedarray-to-buffer')
/** @internal */
import { router} from "./router"
import { routerType} from "./router"

/** @internal */
const utils = {
    toBuffer(arg0: ArrayBuffer): Buffer {
        return arrayBufToBuf(arg0)
    },
    Router: () => {
        return router()
    }
}

declare global {
    const utils: {
        toBuffer(argo: ArrayBuffer): Buffer
        Router(): routerType
    }
}

/* @internal */
export {utils}