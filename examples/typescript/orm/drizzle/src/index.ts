import { ResponseBuilder, Sqlite } from '@fermyon/spin-sdk';
import { ParameterValue } from '@fermyon/spin-sdk/lib/sqlite';
import { eq } from 'drizzle-orm';
import {
  sqliteTable,
  text,
  integer,
  QueryBuilder,
} from 'drizzle-orm/sqlite-core';

const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  age: integer('age'),
});

// Need this as BigInt does not implement to JSON by default.
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export async function handler(_req: Request, res: ResponseBuilder) {
  // Use drizzle to generate the query.
  const qb = new QueryBuilder();
  const query = qb.select().from(users).where(eq(users.name, 'Dan'));
  const { sql, params } = query.toSQL();

  // Use the generated query and parameters to execute against Spin's SQLite database.
  let sqlite = Sqlite.openDefault();
  try {
    let result = sqlite.execute(sql, params as ParameterValue[]);
    res.send(JSON.stringify(result, null, 2));
  } catch (e: any) {
    console.log('Error: ' + JSON.stringify(e.payload));
    res.status(500);
    res.send('Error: ' + JSON.stringify(e));
  }
}
