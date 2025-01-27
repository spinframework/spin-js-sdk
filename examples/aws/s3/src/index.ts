// https://itty.dev/itty-router/routers/autorouter
import { AutoRouter } from 'itty-router';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

const client = new S3Client({
    region: 'us-west-2',
    credentials: {
        accessKeyId: '<>',
        secretAccessKey: '<>',
        sessionToken: '<>',
    },
});
let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get("/list/:bucket", async ({ bucket }) => {
        let command = new ListObjectsV2Command({ Bucket: bucket });
        try {
            let data = await client.send(command);
            return new Response(JSON.stringify(data.Contents, null, 2));
        } catch (e: any) {
            return new Response(`error : ${e.message}`, { status: 500 });
        }
    })
    .get("/stream/:bucket/:file", async ({ bucket, file }) => {
        let command = new GetObjectCommand({ Bucket: bucket, Key: file });
        try {
            const data = await client.send(command);
            return new Response(data.Body as ReadableStream, {
                status: 200,
            });
        } catch (e: any) {
            return new Response(`error : ${e.message}`, { status: 500 });
        }
    })

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});
