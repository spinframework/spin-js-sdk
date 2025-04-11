// https://itty.dev/itty-router/routers/autorouter
import { AutoRouter } from 'itty-router';
import { openDefault } from '@spinframework/spin-kv';

const decoder = new TextDecoder();

let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get("*", async (req: Request) => {
        let store = openDefault();
        let status = 200;
        let body = "Not Found";

        switch (req.method) {
            case 'POST':
                store.set(req.url, (await req.text()) || new Uint8Array().buffer);
                break;
            case 'GET':
                let val;
                val = store.get(req.url);
                if (!val) {
                    status = 404;
                } else {
                    body = decoder.decode(val);
                }
                break;
            case 'DELETE':
                store.delete(req.url);
                break;
            case 'HEAD':
                if (!store.exists(req.url)) {
                    status = 404;
                }
                break;
            default:
        }

        return new Response(body, { status });
    })

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});
