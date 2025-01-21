import { ResponseBuilder, Router } from "@fermyon/spin-sdk";

let router = Router();
// Modify this route or add additional ones to implement the component's API:
router.get("/hello/:name", (metadata, req, res) => { handleHelloRoute(req, res, metadata.params.name) });
// Default route that will be called for any routes not handled above:
router.all("*", (_, req, res) => { notFound(req, res) });

async function handleHelloRoute(req, res, name) {
    res.send(`hello ${name}`);
}
async function notFound(req, res) {
    res.status(404);
    res.send("not found");
}

export async function handler(req, res) {
    await router.handleRequest(req, res);
}
