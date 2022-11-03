/** @internal */
import { Buffer } from 'buffer'

declare global {
    function atob(data:string): string
    function btoa(data:string): string  
}

/** @internal */
function atob(b64: string) {
    return Buffer.from(b64, "base64").toString()
}

/** @internal */
function btoa(data: string) {
    return Buffer.from(data).toString('base64')
}

/** @internal */
export {atob, btoa, Buffer}