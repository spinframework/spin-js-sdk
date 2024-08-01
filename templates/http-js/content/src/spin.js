// This file is a wrapper around the actual handler function defined in `index.js` and attaches it to
// the fetchEvent. If you prefer to directly target the fetchEvent, you can
// modify this file

import { ResponseBuilder } from "@fermyon/spin-sdk";
import { handler } from ".";

addEventListener('fetch', (event) => {
    handleEvent(event);
});

async function handleEvent(event) {

    let resolve, reject;
    let responsePromise = new Promise(async (res, rej) => {
        resolve = res;
        reject = rej;
    });
    event.respondWith(responsePromise);

    let res = new ResponseBuilder(resolve);

    try {
        // In case you want to do some work after the response is sent
        // uncomment the line below and comment out the line with 
        // await handler(event.request, res)
        // event.waitUntil(handler(event.request, res))
        await handler(event.request, res)
    } catch (e) {
        res.status(500);
        res.send(`error in handler: ${e}`);
    }
}