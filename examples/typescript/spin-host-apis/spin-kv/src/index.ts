import { Kv, ResponseBuilder } from "@fermyon/spin-sdk";

const decoder = new TextDecoder()

export async function handler(req: Request, res: ResponseBuilder) {
    let store = Kv.openDefault()
    let status = 200
    let body

    switch (req.method) {
        case "POST":
            store.set(req.url, req.body || (new Uint8Array()).buffer)
            break;
        case "GET":
            let val
            val = store.get(req.url)
            if (!val) {
                status = 404
            } else {
                body = decoder.decode(val)
            }
            break;
        case "DELETE":
            store.delete(req.url)
            break;
        case "HEAD":
            if (!store.exists(req.url)) {
                status = 404
            }
            break;
        default:
    }

    res.status(status)
    res.send(body)
}