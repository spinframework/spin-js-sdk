// https://itty.dev/itty-router/routers/autorouter
import { AutoRouter } from 'itty-router';
import {
    CreateBucketCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';

const s3 = new S3Client({
    endpoint: '<Backblaze b2 endpoint>',
    region: '<>',
    credentials: {
        accessKeyId: '<>',
        secretAccessKey: '<>',
    },
});
let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get("/", async () => {
        try {
            let bucketName = 'spin-sdk-bucket-' + uuid();
            let keyName = 'hello_world.txt';
            await s3.send(new CreateBucketCommand({ Bucket: bucketName }));

            await s3.send(
                new PutObjectCommand({
                    Bucket: bucketName,
                    Key: keyName,
                    Body: 'Hello World!',
                }),
            );
            return new Response(`Successfully uploaded data to ${bucketName}/${keyName}`);
        } catch (e: any) {
            return new Response(`error: ${e}`, { status: 500 });
        }
    })

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});
