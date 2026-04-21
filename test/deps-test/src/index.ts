import { greet } from "component:greeter/greeter";

function handle(_request: Request): Response {
  const greeting = greet("World");
  return new Response(greeting);
}

//@ts-ignore
addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(handle(event.request));
});