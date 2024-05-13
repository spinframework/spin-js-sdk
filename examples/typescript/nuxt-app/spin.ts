import { HttpHandler, type HttpRequest, ResponseBuilder } from "@fermyon/spin-sdk";
import nitroApp from './.output/server/index.mjs'

async function handler(req: HttpRequest, res: ResponseBuilder): Promise<void> {
    const appResponse = await nitroApp.localCall({ url: req.uri, })
    console.log(appResponse)

    res.status(appResponse.status)
    for (const [key, value] of Object.entries(appResponse.headers)) {
        if (value === undefined || value === null) continue
        res.set(key, value as string)
    }
    res.send(appResponse.body)
}

class App extends HttpHandler {
    handleRequest(req: HttpRequest, res: ResponseBuilder): Promise<void> {
        return handler(req, res)
    }
}
export const incomingHandler = new App()
