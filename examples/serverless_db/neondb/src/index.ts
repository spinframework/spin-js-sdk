// https://itty.dev/itty-router/routers/autorouter
import { AutoRouter } from 'itty-router';
import { neon } from '@neondatabase/serverless';

let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get("/", async () => {
        try {
            const sql = neon('<neon-database-endpoint>');
            const posts = await sql('SELECT * FROM posts');
            return new Response(JSON.stringify(posts, null, 2), { headers: { 'Content-Type': 'application/json' } });
        } catch (e: any) {
            return new Response(`error: ${e}`, { status: 500 });
        }
    })

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});
