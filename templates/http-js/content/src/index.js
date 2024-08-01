import { ResponseBuilder } from "@fermyon/spin-sdk";

export async function handler(req, res) {
    console.log(req);
    res.send("hello universe");
}
