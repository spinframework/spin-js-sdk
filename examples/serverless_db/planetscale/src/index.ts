// https://itty.dev/itty-router/routers/autorouter
import { AutoRouter } from 'itty-router';
import { connect } from '@planetscale/database';

const config = {
    host: '<host>',
    username: '<username>',
    password: '<password>',
};

let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get("/", async () => {
        try {
            const conn = connect(config);
            const results = await conn.execute('SHOW TABLES');
            return new Response(JSON.stringify(results, null, 2));
        } catch (e: any) {
            return new Response(`error: ${e}`, { status: 500 });
        }
    })

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});
