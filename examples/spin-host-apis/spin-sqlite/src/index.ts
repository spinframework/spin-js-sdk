import { ResponseBuilder, Sqlite } from '@fermyon/spin-sdk';

export async function handler(_req: Request, res: ResponseBuilder) {
  try {
    let conn = Sqlite.openDefault();
    let result = conn.execute('SELECT * FROM todos WHERE id > (?);', [1]);
    res.send(JSON.stringify(result));
  } catch (e: any) {
    console.log('Error: ' + JSON.stringify(e.payload));
    res.status(500);
    res.send('Error: ' + JSON.stringify(e));
  }
}
