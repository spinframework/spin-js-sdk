import { HttpHandler, HttpRequest, ResponseBuilder } from "@fermyon/spin-sdk";
import { handler } from ".";

class App extends HandlerHandler {
    handleRequest(req: HttpRequest, res: ResponseBuilder): Promise<void> {
        return handler(req, res)
    }
}

export const incomingHandler = new App()
