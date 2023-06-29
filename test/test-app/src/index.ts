import { HandleRequest, HttpRequest, HttpResponse, Sqlite, spinSdk } from "spin-sdk"
import { health, headersTest, outboundHttp, fileRead, dirRead, testFunctionality } from "./test"

const router = spinSdk.Router()

// Add paths for router
router.get("/", testFunctionality)
router.get("/health", health)
router.get("/headersTest", headersTest)
router.get("/outboundHttp", outboundHttp)
router.get("/fileRead", fileRead)
router.get("/dirRead", dirRead)

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {

  const conn = Sqlite.openDefault();
  conn.execute("SELECT * FROM todos WHERE id > (?);", [1]);
  
  return await router.handle({
    method: request.method,
    url: request.headers["spin-full-url"]
  })
}

