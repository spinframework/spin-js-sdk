// https://itty.dev/itty-router/routers/autorouter
import { AutoRouter } from 'itty-router';
import { open } from '@spinframework/spin-redis';

const encoder = new TextEncoder();
const redisAddress = 'redis://localhost:6379/';

let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get("/", () => {
        try {
            let db = Redis.open(redisAddress);
            db.set('test', encoder.encode('Hello world'));
            let val = db.get('test');

            if (!val) {
                return new Response(null, { status: 404 });
            }
            return new Response(val);
        } catch (e: any) {
            return new Response(`Error: ${JSON.stringify(e.payload)}`, { status: 500 });
        }
    })

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});
