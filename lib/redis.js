//@ts-ignore
import * as spinRedis from "fermyon:spin/redis@2.0.0";
export function open(address) {
    return spinRedis.Connection.open(address);
}
