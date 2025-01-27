// https://itty.dev/itty-router/routers/autorouter
import { AutoRouter } from 'itty-router';
import { Client } from '@upstash/qstash';

const client = new Client({ token: '<upstash token>' });
let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get("/", async () => {
        let resp = await client.publishJSON({
            url: '<>',
            body: { hello: 'world' },
            delay: 2,
        });

        return new Response(JSON.stringify(resp), { status: 200 });
    })

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});
