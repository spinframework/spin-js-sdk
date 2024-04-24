import { HttpHandler, HttpRequest, ResponseBuilder } from "@fermyon/spin-sdk";
import { handler } from ".";

class App extends HttpHandler {
    handleRequest(req: HttpRequest, res: ResponseBuilder): Promise<void> {
        return handler(req, res)
    }
}

export const incomingHandler = new App()
