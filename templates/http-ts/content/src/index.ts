import { ResponseBuilder, Router } from "@fermyon/spin-sdk";

let router = Router();
// Modify this route or add additional ones to implement the component's API:
router.get("/hello/:name", (metadata, req, res) => { handleHelloRoute(req, res, metadata.params.name) });
// Default route that will be called for any routes not handled above:
router.all("*", (_, req, res) => { notFound(req, res) });

async function handleHelloRoute(req: Request, res: ResponseBuilder, name: string) {
    res.send(`hello ${name}`);
}
async function notFound(req: Request, res: ResponseBuilder) {
    res.status(404);
    res.send("not found");
}

export async function handler(req: Request, res: ResponseBuilder) {
    await router.handleRequest(req, res);
}
