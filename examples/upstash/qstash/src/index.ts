import { ResponseBuilder } from '@fermyon/spin-sdk';
import { Client } from '@upstash/qstash';

const client = new Client({ token: '<upstash token>' });

export async function handler(_req: Request, res: ResponseBuilder) {
  const resp = await client.publishJSON({
    url: '<>',
    body: { hello: 'world' },
    delay: 2,
  });
  console.log(resp);
  res.send('hello universe');
}
