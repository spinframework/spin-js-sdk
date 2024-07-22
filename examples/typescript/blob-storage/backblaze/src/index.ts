import {
  CreateBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ResponseBuilder } from '@fermyon/spin-sdk';
import { v4 as uuid } from 'uuid';

const s3 = new S3Client({
  endpoint: '<Backblaze b2 endpoint>',
  region: '<>',
  credentials: {
    accessKeyId: '<>',
    secretAccessKey: '<>',
  },
});

export async function handler(_req: Request, res: ResponseBuilder) {
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
    res.send(`Successfully uploaded data to ${bucketName}/${keyName}`);
  } catch (e: any) {
    res.status(500);
    res.send(`error: ${e}`);
  }
}
