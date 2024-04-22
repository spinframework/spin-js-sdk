import { SimpleHTTP } from "@fermyon/spin-sdk";
import { handleRequest } from ".";

class HttpHandler extends SimpleHTTP {
    constructor() {
        super();
    }
    handleRequest = handleRequest
}

export const incomingHandler = new HttpHandler()