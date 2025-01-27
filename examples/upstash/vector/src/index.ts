// https://itty.dev/itty-router/routers/autorouter
import { AutoRouter } from 'itty-router';
import { Index } from '@upstash/vector';

const index = new Index({
    url: '<upstash URL>',
    token: '<Upstash token>',
});

let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get("/", async () => {
        try {
            await index.upsert({
                id: '1',
                vector: [0.6, 0.8],
                metadata: { field: 'value' },
            });
            await index.upsert({
                id: '2',
                vector: [0.6, 0.6],
                metadata: { field: 'value' },
            });

            let data = await index.query({
                vector: [0.6, 0.7],
                topK: 3,
                includeMetadata: true,
            });
            return new Response(JSON.stringify(data, null, 2), { status: 200 });
        } catch (e: any) {
            return new Response(`error: ${e}`, { status: 500 });
        }
    })

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});
