import { HandleRequest, HttpRequest, HttpResponse } from "spin-sdk"
import { health, headersTest, outboundHttp, fileRead, dirRead, testFunctionality } from "./test"

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const router = utils.Router()

// Add paths for router
router.get("/", testFunctionality)
router.get("/health", health)
router.get("/headersTest", headersTest)
router.get("/outboundHttp", outboundHttp)
router.get("/fileRead", fileRead)
router.get("/dirRead", dirRead)

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {

  return await router.handle({
    method: request.method,
    url: request.headers["spin-full-url"]
  })
}

