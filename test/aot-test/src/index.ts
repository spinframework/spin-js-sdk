import { AutoRouter } from 'itty-router';

let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
  .get('/fibonacci/:n', ({ n }) => {
    const num = parseInt(n, 10);
    if (isNaN(num)) {
      return new Response('Invalid number', { status: 400 });
    }
    // We should time this function to ensure that AOT compilation is working correctly, as the Fibonacci function is computationally expensive for larger inputs
    const start = performance.now();
    const fib = (n: number): number => {
      if (n <= 1) return n;
      return fib(n - 1) + fib(n - 2);
    };
    const result = fib(num);
    const end = performance.now();
    console.log(`Fibonacci(${num}) = ${result}, computed in ${end - start} ms`);
    return new Response(`{result: ${result}, time: ${end - start} ms}`, {
      headers: { 'Content-Type': 'application/json' },
    });

  });

//@ts-ignore
addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(router.fetch(event.request));
});

