import { ResponseBuilder, Redis } from '@fermyon/spin-sdk';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const redisAddress = 'redis://localhost:6379/';

export async function handler(_req: Request, res: ResponseBuilder) {
  try {
    let db = Redis.open(redisAddress);
    db.set('test', encoder.encode('Hello world'));
    let val = db.get('test');

    if (!val) {
      res.status(404);
      res.send();
      return;
    }

    res.send(val);
  } catch (e: any) {
    res.status(500);
    res.send(`Error: ${JSON.stringify(e.payload)}`);
  }
}
