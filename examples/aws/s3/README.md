# AWS S3 Integration

This example showcases how to connect to and send messages using Amazon S3 with the AWS SDK.

## Prerequisites
- `spin >=2.6.0`

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
       region: "us-west-2",
       credentials: {
           accessKeyId: "<>",
           secretAccessKey: "<>",
           sessionToken: "<>"
       },
   });
   ```
   *note*: The example assumes that the bucket is in the `us-west-2` region. If the object is in some other region modify the configuration of the client and also edit the `allowed_outbound_hosts` in the `spin.toml`.

## Building and Running the Example

```bash
spin build
spin up
```

### Testing the different endpoints

- `curl -v http://127.0.0.1:3000/list/<bucket name>` to list the objects stored in the given bucket.
- `curl -v http://127.0.0.1:3000/stream/<bucket name>/<object key>`  to stream the object in the given bucket.