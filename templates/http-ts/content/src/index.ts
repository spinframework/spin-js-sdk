import { ResponseBuilder, SimpleRequest } from "@fermyon/spin-sdk/lib/http"

export const handleRequest = async (req: SimpleRequest, res: ResponseBuilder) => {
    res.send("hello world")
}