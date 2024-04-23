import { HttpRequest, ResponseBuilder } from "@fermyon/spin-sdk";

export async function handler(req: HttpRequest, res: ResponseBuilder) {
    console.log("Request: ", req.uri);
    res.send("Hello, Universe!");
}
