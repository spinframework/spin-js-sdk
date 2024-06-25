import { ResponseBuilder } from "@fermyon/spin-sdk";
import { Index } from "@upstash/vector";

const index = new Index({
    url: "<>",
    token: "<>"
})


export async function handler(req: Request, res: ResponseBuilder) {
    try {
        await index.upsert({ id: "1", vector: [0.6, 0.8], metadata: { field: "value" } })
        await index.upsert({ id: "2", vector: [0.6, 0.6], metadata: { field: "value" } })

        let data = await index.query({ vector: [0.6, 0.7], topK: 3, includeMetadata: true })
        res.send(JSON.stringify(data, null, 2))
    } catch (e: any) {
        res.status(500)
        res.send(`error: ${e}`)
    }
}
