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

    await handler(event.request, res)
}

// Keep wizer happy during pre-init. Should go away
// oncehttps://github.com/bytecodealliance/ComponentizeJS/issues/114 is resolved
export const incomingHandler = {
    handle() { }
}