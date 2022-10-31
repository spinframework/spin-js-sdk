interface HttpRequest {
  method: string
  uri: string
  headers: Array<[string, string]>
  body?: ArrayBuffer
}

interface SpinConfig {
  get(arg0: string): string
}

interface SpinSDK {
  config: SpinConfig
}


interface HttpResponse {
  status: number
  headers: Map<string, string>
  body?: ArrayBuffer
}

type HandleRequest = (request: HttpRequest) => Promise<HttpResponse>

interface FetchHeaders {
  entries: () => Iterator<[string, string]>
}

interface FetchResult {
  status: number
  headers: FetchHeaders
  arrayBuffer: () => Promise<ArrayBuffer>
  ok: boolean
  statusText: string
  text: () => Promise<string>
  json: () => Promise<object>
}

declare global {
  function fetch(uri: string, options?: object): Promise<FetchResult>
  const spinSdk: SpinSDK
}


export {HttpRequest, HandleRequest, HttpResponse}
