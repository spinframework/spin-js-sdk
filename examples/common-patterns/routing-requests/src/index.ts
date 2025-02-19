// https://itty.dev/itty-router/routers/autorouter
import { AutoRouter } from 'itty-router';

let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
  .get('/', () => new Response('Hello, Fermyon'))
  .get('/hello/:name', ({ name }) => `Hello, ${name}!`)
  .get('/bye/:name', ({ name }) => sayGoodBye(name))
  .get('/reverse-header-value', req => reverseHeaderValue(req))
  .post('/items', async (req) => processItem(await req.arrayBuffer()));


//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
  event.respondWith(router.fetch(event.request));
});

const sayGoodBye = (name: string): Response => {
  const payload = {
    message: `Goodbye, ${name}`
  };
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'content-type': 'application/json'
    }
  });
}

const reverseHeaderValue = (req: Request): Response => {
  const headerValue = req.headers.get('x-spin-demo');
  if (!headerValue) {
    return new Response('Bad Request', { status: 400 });
  }
  return new Response(undefined, {
    status: 200, headers: {
      'x-spin-demo': headerValue.split('').reverse().join('')
    }
  });
}

const processItem = (requestBody: ArrayBuffer): Response => {
  const decoder = new TextDecoder();
  let payload;
  try {
    payload = JSON.parse(decoder.decode(requestBody));
  }
  catch (error) {
    return new Response('Bad Request', { status: 400 });
  }
  console.log(`Processing item ${JSON.stringify(payload)}`);
  return new Response('Item processed', { status: 200 });
};
