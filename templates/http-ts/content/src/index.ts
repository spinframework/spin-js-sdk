import { ResponseBuilder, HttpRequest } from "@fermyon/spin-sdk"

export const handleRequest = async (req: HttpRequest, res: ResponseBuilder) => {
    res.send("hello world- I ACTUALLY WORK!!!")
}
