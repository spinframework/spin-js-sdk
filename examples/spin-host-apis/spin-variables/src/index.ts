// https://itty.dev/itty-router/routers/autorouter
import { AutoRouter } from 'itty-router';
import { get } from '@spinframework/spin-variables';

let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get("/", () => {
        let val = get('my_variable');
        if (!val) {
            return new Response(null, { status: 404 });
        }
        return new Response(val);
    })

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});
