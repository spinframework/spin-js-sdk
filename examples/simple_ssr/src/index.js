import React from "react"
import ReactDOMServer from "react-dom/server"

import App from "./client/App.js"

const encoder = new TextEncoder("utf-8")
const decoder = new TextDecoder("utf-8")

export async function handleRequest(request) {

    let htmlFile = await fsPromises.readFile("./index.html")
    let htmlContent = decoder.decode(htmlFile);

    let renderedContent = htmlContent.replace(
        '<div id="root"></div>',
        `<div id="root">${ReactDOMServer.renderToString(<App />)}</div>`
    )

    return {
        status: 200,
        headers: { "foo": "bar" },
        body: renderedContent
    }
}