import { ResponseBuilder } from '@fermyon/spin-sdk';
import { neon } from '@neondatabase/serverless';

export async function handler(_req: Request, res: ResponseBuilder) {
  try {
    const sql = neon('<neon-database-endpoint>');
    const posts = await sql('SELECT * FROM posts');
    res.send(JSON.stringify(posts, null, 2));
  } catch (e: any) {
    res.status(500);
    res.send(`error: ${e}`);
  }
}
