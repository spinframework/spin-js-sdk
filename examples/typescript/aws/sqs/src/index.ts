const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

import { ResponseBuilder } from "@fermyon/spin-sdk";

const client = new SQSClient({
    region: "<>",
    credentials: {
        accessKeyId: "<>",
        secretAccessKey: "<>",
        sessionToken: "<>"
    },
});

const params = {
    MessageBody: 'This is a test message with SQSClient.',
    QueueUrl: '<>'
};

const command = new SendMessageCommand(params);

export async function handler(req: Request, res: ResponseBuilder) {
    let data
    try {
        data = await client.send(command);
        res.send("success")
    } catch (e: any) {
        res.status(500)
        res.send(`error : ${e.message}`)
    }
}