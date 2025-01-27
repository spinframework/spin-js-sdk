import { Router } from "itty-router"
import { headersTest, health, kvTest, kvTestUint8Array, outboundHttp, statusTest, stream, streamTest, testFunctionality } from "./test";

let router = Router()

router.get("/health", health)
router.get("/stream", stream)
router.get("/statusTest", statusTest)
router.get("/headersTest", headersTest)
router.get("/outboundHttp", outboundHttp)
router.get("/kvTest", kvTest)
router.get("/kvTestUint8Array", kvTestUint8Array)
router.get("/streamTest", streamTest)
router.get("/testFunctionality", testFunctionality)


//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});
