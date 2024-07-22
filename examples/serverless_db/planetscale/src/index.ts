import { ResponseBuilder } from '@fermyon/spin-sdk';
import { connect } from '@planetscale/database';

const config = {
  host: '<host>',
  username: '<username>',
  password: '<password>',
};

export async function handler(_req: Request, res: ResponseBuilder) {
  try {
    const conn = connect(config);
    const results = await conn.execute('SHOW TABLES');
    res.send(JSON.stringify(results, null, 2));
  } catch (e: any) {
    res.status(500);
    res.send(`error: ${e}`);
  }
}
