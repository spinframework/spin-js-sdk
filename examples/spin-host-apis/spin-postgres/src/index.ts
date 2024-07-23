import { ResponseBuilder, Postgres } from '@fermyon/spin-sdk';

const DB_URL = 'host=localhost user=postgres dbname=spin_dev';

export async function handler(_req: Request, res: ResponseBuilder) {
  let conn = Postgres.open(DB_URL);
  conn.execute('delete from test where id=4', []);
  conn.execute('insert into test values (4,5)', []);
  let ret = conn.query('select * from test', []);

  res.send(JSON.stringify(ret, null, 2));
}
