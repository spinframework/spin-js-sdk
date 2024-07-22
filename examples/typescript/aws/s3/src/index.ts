import { ResponseBuilder } from '@fermyon/spin-sdk';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const client = new S3Client({
  region: '<>',
  credentials: {
    accessKeyId: '<>>',
    secretAccessKey: '<>',
    sessionToken: '<>',
  },
});

const params = {
  Bucket: '<>',
};

export async function handler(_req: Request, res: ResponseBuilder) {
  const command = new ListObjectsV2Command(params);
  try {
    let data = await client.send(command);
    res.send(JSON.stringify(data.Contents, null, 2));
  } catch (e: any) {
    res.status(500);
    res.send(`error : ${e.message}`);
  }
}
