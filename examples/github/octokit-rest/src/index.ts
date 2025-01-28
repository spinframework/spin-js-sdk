// https://itty.dev/itty-router/routers/autorouter
import { AutoRouter } from 'itty-router';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit();
let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get("/", async () => {
        let data = await octokit.rest.repos.listForOrg({
            org: 'fermyon',
            type: 'public',
        });
        return new Response(JSON.stringify(data, null, 2), {
            headers: {
                "content-type": "application/json"
            }
        })
    })

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});
