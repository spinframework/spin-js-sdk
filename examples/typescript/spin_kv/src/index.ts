import { HandleRequest, HttpRequest, HttpResponse, Kv } from "@fermyon/spin-sdk"

const decoder = new TextDecoder()

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {

  let store = Kv.openDefault()
  let status = 200
  let body

  switch (request.method) {
    case "POST":
      store.set(request.uri, request.body || (new Uint8Array()).buffer)
      break;
    case "GET":
      let val
        val = store.get(request.uri)
        if (!val) {
          status = 404
        } else {
          body = decoder.decode(val)
        }
      break;
    case "DELETE":
      store.delete(request.uri)
      break;
    case "HEAD":
      if (!store.exists(request.uri)) {
        status = 404
      }
      break;
    default:
  }

  return {
    status: status,
    body: body
  }
}