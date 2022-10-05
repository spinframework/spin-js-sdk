import {HttpRequest} from "spin-sdk-types"

import { connect } from '@planetscale/database'

const config = {
   host: '<host>',
   username: '<username>',
   password: '<password>'
}

const encoder = new TextEncoder()

export async function handleRequest(_request: HttpRequest) {
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
