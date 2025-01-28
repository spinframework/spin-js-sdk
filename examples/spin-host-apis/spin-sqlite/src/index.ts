// https://itty.dev/itty-router/routers/autorouter
import { AutoRouter } from 'itty-router';
import { Sqlite } from '@fermyon/spin-sdk';

let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get("/", () => {
        try {
            let conn = Sqlite.openDefault();
            let result = conn.execute('SELECT * FROM todos WHERE id > (?);', [1]);
            return new Response(JSON.stringify(result));
        } catch (e: any) {
            console.log('Error: ' + JSON.stringify(e.payload));
            return new Response('Error: ' + JSON.stringify(e), { status: 500 });
        }
    })

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});
