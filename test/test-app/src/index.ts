import { ResponseBuilder, Router } from "@fermyon/spin-sdk";
import { testFunctionality, health, statusTest, headersTest, outboundHttp, kvTest } from "./test";

let router = Router()

router.get("/", async (_, req, res) => { await testFunctionality(req, res) })
router.get("/statusTest", async (_, req, res) => { await statusTest(req, res) })
router.get("/headersTest", async (_, req, res) => { await headersTest(req, res) })
router.get("/outboundHttp", async (_, req, res) => { await outboundHttp(req, res) })
router.get("/kvTest", async (_, req, res) => { await kvTest(req, res) })
router.get("/health", async (_, req, res) => { await health(req, res) })
router.all("*", async (_, req, res) => { res.status(404); res.send(); })

export async function handler(req: Request, res: ResponseBuilder) {
    await router.handleRequest(req, res)
}
