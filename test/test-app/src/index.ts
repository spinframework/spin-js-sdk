import { HttpRequest, ResponseBuilder, Router } from "@fermyon/spin-sdk";
import { testFunctionality, health } from "./test";

let router = Router()

router.get("/", async (_, req, res) => { await testFunctionality(req, res) })
router.get("/health", async (_, req, res) => { await health(req, res) })

export async function handler(req: HttpRequest, res: ResponseBuilder) {
    await router.handleRequest(req, res)
}
