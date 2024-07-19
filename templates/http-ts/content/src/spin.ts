import { ResponseBuilder } from "@fermyon/spin-sdk";
import { handler } from ".";

//@ts-ignore
addEventListener('fetch', (event: FetchEvent) => {
    handleEvent(event);
});

async function handleEvent(event: FetchEvent) {

    let resolve: any, reject: any;
    let responsePromise = new Promise(async (res, rej) => {
        resolve = res;
        reject = rej;
    });
    //@ts-ignore
    event.respondWith(responsePromise);

    let res = new ResponseBuilder(resolve);

    try {
        // In case you want to do some work after the response is sent
        // uncomment the line below and comment out the line with 
        // await handler(event.request, res)
        // event.waitUntil(handler(event.request, res))
        await handler(event.request, res)
    } catch (e: any) {
        if (res.getStatus() == 200) {
            res.status(500);
        }
        res.send(`error in handler: ${e}`);
    }
}