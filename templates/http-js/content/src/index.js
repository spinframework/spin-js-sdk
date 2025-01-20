import { ResponseBuilder, Router } from "@fermyon/spin-sdk";

let router = Router();
router.get("*", (_, req, res) => { handleDefaultRoute(req, res) })
router.all("*", (_, req, res) => { notFound(req, res) })

async function handleDefaultRoute(req, res) {
    res.send("hello universe");
}

async function notFound(req, res) {
    res.status(404);
    res.send("not found");
}

export async function handler(req, res) {
    await router.handleRequest(req, res);
}