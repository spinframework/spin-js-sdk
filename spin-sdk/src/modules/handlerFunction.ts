import 'fast-text-encoding'

let encoder = new TextEncoder()
let decoder = new TextDecoder()

interface BaseHttpRequest {
  method: string
  uri: string
  body?: ArrayBuffer
  headers: Record<string, string>
}

interface HttpRequest extends BaseHttpRequest {
  json: () => object
  text: () => string
}

interface BaseHttpResponse {
  status: number
  headers?: Record<string, string>
}

interface InternalHttpResponse extends BaseHttpResponse {
  body?: ArrayBuffer
}

interface HttpResponse extends BaseHttpResponse {
  body?: ArrayBuffer | string | Uint8Array
}

type HandleRequest = (request: HttpRequest) => Promise<HttpResponse>


type Handler = (request: HttpRequest, response: ResponseBuilder) => Promise<void>

class ResponseBuilder {
  response: HttpResponse
  statusCode: number
  constructor() {
      this.response = {
          status: 200,
          headers: {}
      }
      this.statusCode = this.response.status
  }
  getHeader(key: string) {
      return this.response.headers![key] || null
  }
  header(key: string, value: string) {
      this.response.headers![key] = value
      return this
  }
  status(status: number) {
      this.response.status! = status
      this.statusCode = this.response.status
      return this
  }
  body(data: ArrayBuffer | Uint8Array | string) {
      this.response.body = encodeBody(data)
      return this
  }
}

function encodeBody(body: ArrayBuffer | Uint8Array | string) {
  if (typeof (body) == "string") {
      return encoder.encode(body).buffer
  } else if (ArrayBuffer.isView(body)) {
      return body.buffer
  } else {
      return body
  }
}

export {HandleRequest, Handler, HttpRequest, HttpResponse}