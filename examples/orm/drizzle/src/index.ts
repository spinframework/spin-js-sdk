// https://itty.dev/itty-router/routers/autorouter
import { Sqlite, ParameterValue } from '@spinframework/spin-sqlite';
import { AutoRouter } from 'itty-router';
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

let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get("/", () => {
        // Use drizzle to generate the query.
        const qb = new QueryBuilder();
        const query = qb.select().from(users).where(eq(users.name, 'Dan'));
        const { sql, params } = query.toSQL();

        // Use the generated query and parameters to execute against Spin's SQLite database.
        let sqlite = Sqlite.openDefault();
        try {
            let result = sqlite.execute(sql, params as ParameterValue[]);
            return new Response(JSON.stringify(result, null, 2), { status: 200 });
        } catch (e: any) {
            return new Response('Error: ' + JSON.stringify(e), { status: 500 });
        }
    })

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});
