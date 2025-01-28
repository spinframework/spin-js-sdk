// https://itty.dev/itty-router/routers/autorouter
import { AutoRouter } from 'itty-router';

let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get("*", getDataFromAPI)

async function getDataFromAPI(_request: Request) {
    let response = await fetch(
        'https://random-data-api.fermyon.app/physics/json',
    );
    return response;
}

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});
