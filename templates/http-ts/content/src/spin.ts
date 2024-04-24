import { Handler, HttpRequest, ResponseBuilder } from "@fermyon/spin-sdk";
import { handler } from ".";

class HttpHandler extends Handler {
    handleRequest(req: HttpRequest, res: ResponseBuilder): Promise<void> {
        return handler(req, res)
    }
}

export const incomingHandler = new HttpHandler()
