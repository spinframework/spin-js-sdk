import { ResponseBuilder } from "@fermyon/spin-sdk";
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const client = new S3Client({
    region: "<>",
    credentials: {
        accessKeyId: "<>>",
        secretAccessKey: "<>",
        sessionToken: "<>"
    },
});

const params = {
    Bucket: "<>"
};

const command = new ListObjectsV2Command(params);

export async function handler(req: Request, res: ResponseBuilder) {
    let data
    try {
        data = await client.send(command);
        res.send(JSON.stringify(data.Contents, null, 2));
    } catch (e: any) {
        res.status(500)
        res.send(`error : ${e.message}`)
    }
}