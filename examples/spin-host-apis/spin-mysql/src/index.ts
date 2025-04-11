// https://itty.dev/itty-router/routers/autorouter
import { AutoRouter } from 'itty-router';
import { open } from '@spinframework/spin-mysql';

// Connects as the root user without a password
const DB_URL = 'mysql://root:@127.0.0.1/spin_dev';

let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get("/", () => {
        let conn = open(DB_URL);
        conn.execute('delete from test where id=?', [4]);
        conn.execute('insert into test values (4,5)', []);
        let ret = conn.query('select * from test', []);

        return new Response(JSON.stringify(ret, null, 2));
    })

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});
