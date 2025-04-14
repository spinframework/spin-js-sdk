// https://itty.dev/itty-router/routers/autorouter
import { AutoRouter } from 'itty-router';
import { infer } from '@spinframework/spin-llm';


let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get("/", () => {
        try {
            let result = infer(Llm.InferencingModels.Llama2Chat, 'tell me a joke');
            return new Response(JSON.stringify(result));
        } catch (e: any) {
            return new Response(e.message, { status: 500 });
        }
    })

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});
