# Backblaze B2 Integration

This example showcases how to connect to and send messages using Backblaze B2 with the AWS SDK.

## Prerequisites
- `spin >=2.6.0`

## Setup the Example

1. **Create an AWS Account**
   - If you don't have an Backblaze account, create one at [Backblaze](https://www.backblaze.com/).

2. **Get Backblaze Credentials**
   - Create or obtain your Backblaze credentials (Access Key ID, Secret Access Key).

3. **Configure the Code**
   - Copy the region, access key ID, secret access key, into the code at `src/index.ts`.

   ```typescript
   const s3 = new S3Client({
     endpoint: '<Backblaze b2 endpoint>',
     region: '<>',
     credentials: {
       accessKeyId: '<>',
       secretAccessKey: '<>',
     },
   });
   ```

## Building and Running the Example

```bash
spin build
spin up
```

Use e.g. `curl -v http://127.0.0.1:3000/` to test the endpoint.
