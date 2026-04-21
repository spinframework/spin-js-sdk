import { fibonacci as fibonacciRS } from 'component:fibonacci/utils@0.1.0';

function handle(_request: Request): Response {
  const n = 30; // Fibonacci number to calculate

  const startJS = performance.now();
  const resultJS = fibonacci(n);
  const endJS = performance.now();

  const startRS = performance.now();
  const resultRS = fibonacciRS(n);
  const endRS = performance.now();

  return new Response(
    JSON.stringify({
      js: { result: resultJS, time: endJS - startJS },
      rust: { result: resultRS, time: endRS - startRS },
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

//@ts-ignore
addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(handle(event.request));
});

function fibonacci(n: number): number {
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}