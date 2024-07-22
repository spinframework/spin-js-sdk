# AWS S3 Integration

This example showcases how to connect to and send messages using Amazon S3 with the AWS SDK.

## Prerequisites
- `spin >=2.6.0`
- 

## Install Dependencies
Install the necessary npm packages:

```bash
npm install
```

## Setup the Example

1. **Create an AWS Account**
   - If you don't have an AWS account, create one at [AWS](https://aws.amazon.com/).

2. **Create an S3 bucket**
   - Go to the [Amazon S3 Console](https://console.aws.amazon.com/s3/).
   - Create a new bucket and add files to it. Note down the bucket name.

3. **Get AWS Credentials**
   - Create or obtain your AWS credentials (Access Key ID, Secret Access Key, and a Session Token).

4. **Configure the Code**
   - Copy the region, access key ID, secret access key, session token, and bucket name into the code at `src/index.ts`.

   ```typescript
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
   ```

## Building and Running the Example

```bash
spin build
spin up
```

Use e.g. `curl -v http://127.0.0.1:3000/` to test the endpoint.
