import {HandleRequest, HttpRequest, HttpResponse, Config} from "@fermyon/spin-sdk"

import { connect } from '@planetscale/database'

const config = {
   host: Config.get("host"),
   username: Config.get("username"),
   password: Config.get("password")
}

const encoder = new TextEncoder()

export const handleRequest: HandleRequest = async function(request: HttpRequest): Promise<HttpResponse> {
   const body = `Planetscale responded successfully`
   const conn = await connect(config)
   const results = await conn.execute('SHOW TABLES')
   console.log(results)
   for (const k in results) {
       // @ts-ignore
       console.log(k,":", results[k])
   }

   return {
        status: 200,
        headers: { "foo": "bar" },
        body: encoder.encode(body).buffer
   }
}
