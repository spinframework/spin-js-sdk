import { ResponseBuilder, Mysql } from '@fermyon/spin-sdk';

// Connects as the root user without a password
const DB_URL = 'mysql://root:@127.0.0.1/spin_dev';

export async function handler(_req: Request, res: ResponseBuilder) {
  let conn = Mysql.open(DB_URL);
  conn.execute('delete from test where id=?', [4]);
  conn.execute('insert into test values (4,5)', []);
  let ret = conn.query('select * from test', []);

  res.send(JSON.stringify(ret, null, 2));
}
