import { AutoRouter } from "itty-router"
import { headersTest, health, kvTest, kvTestUint8Array, outboundHttp, statusTest, stream, streamTest, testFunctionality } from "./test";

// Verify top level init location
if (globalThis.location.href != "http://foo.bar/") {
    throw new Error(`Expected top-level init location to be "top-level", got "${globalThis.location}"`);
} else {
    console.log("Top-level init location verified:", globalThis.location.href);
}

let router = AutoRouter()

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