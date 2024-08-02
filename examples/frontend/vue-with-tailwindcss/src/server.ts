import { ResponseBuilder } from "@fermyon/spin-sdk"
import { renderToString } from "@vue/server-renderer"
import { createSSRApp } from "vue";
import { initRouter } from "./router";
import App from "./App.vue";

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

    await handleRequest(event.request, res);
}

export default async function handleRequest(req: Request, res: ResponseBuilder) {
    let path = "/" + req.url.split("/").pop() || "/";

    const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.ico" />
    <title>Vue + TailwindCSS app</title>
    <!--app-head-->
</head>
<body>
    <div id="app"><!--app-html--></div>
    <script type="module" src="/static/client.js"></script>
</body>
</html>`

    try {
        const app = createSSRApp(App)
        const router = initRouter(true)
        app.use(router)
        const rendered = await renderToString(app)

        res.status(200)
        res.set('Content-Type', 'text/html')
        const html = template.replace("<!--app-html-->", rendered)
        res.send(html)
    } catch (e: any) {
        console.log(e)
        res.status(500).send("Internal Server Error")
    }
}

