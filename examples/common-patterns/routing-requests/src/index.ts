import { ResponseBuilder, Router } from '@fermyon/spin-sdk';

let router = Router();

router.get("/", (_, req, res) => { handleDefaultRoute(req, res) })
router.get("/home/:id", (metadata, req, res) => { handleHomeRoute(req, res, metadata.params.id) })

async function handleDefaultRoute(_req: Request, res: ResponseBuilder) {
  res.set({ "content-type": "text/plain" });
  res.send("Hello from default route");
}

async function handleHomeRoute(_req: Request, res: ResponseBuilder, id: string) {
  res.set({ "content-type": "text/plain" });
  res.send(`Hello from home route with id: ${id}`);
}

export async function handler(req: Request, res: ResponseBuilder) {
  await router.handleRequest(req, res);
}
