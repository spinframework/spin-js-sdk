// https://itty.dev/itty-router/routers/autorouter
import { AutoRouter } from 'itty-router';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const client = new SQSClient({
    region: '<>',
    credentials: {
        accessKeyId: '<>',
        secretAccessKey: '<>',
        sessionToken: '<>',
    },
});

const params = {
    MessageBody: 'This is a test message with SQSClient.',
    QueueUrl: '<>',
};

let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get("/", async () => {
        let command = new SendMessageCommand(params);
        try {
            await client.send(command);
            return new Response('success');
        } catch (e: any) {
            return new Response(`error : ${e.message}`, { status: 500 });
        }
    })

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});
