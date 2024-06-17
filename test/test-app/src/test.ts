import { ResponseBuilder } from "@fermyon/spin-sdk";

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function health(req: Request, res: ResponseBuilder) {
    res.status(200)
    res.send("Server is healthy")
}

async function testFunctionality(req: Request, res: ResponseBuilder) {
    //TODO: Add tests once fetch is available
    res.status(200)
    res.send("test completed successfully")
}

export {
    health,
    testFunctionality
}