
function handle(_request) {
  return new Response('Hello, Spin!', {
    status: 200,
    headers: {
      'content-type': 'text/plain'
    }
  });
}

addEventListener('fetch', (event) => {
  event.respondWith(handle(event.request));
});
