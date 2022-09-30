import { connect } from '@planetscale/database'

const config = {
   host: '<host>',
   username: '<username>',
   password: '<password>'
}

const encoder = new TextEncoder("utf-8")

export async function handleRequest(request) {
   const body = `Planetscale responded successfully`
   const conn = await connect(config)
   const results = await conn.execute('SHOW TABLES')
   console.log(results)
   for (const k in results) {
       console.log(k,":", results[k])
   }

   return {
       status: 200,
       headers: { "foo": "bar" },
       body: encoder.encode(body).buffer
   }
}
