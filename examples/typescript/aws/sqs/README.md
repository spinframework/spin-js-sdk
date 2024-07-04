# AWS SQS Integration

This example showcases how to connect to and send messages using Amazon SQS with the AWS SDK.

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

2. **Create an SQS Queue**
   - Go to the [Amazon SQS Console](https://console.aws.amazon.com/sqs/).
   - Create a new SQS queue and note down the Queue URL.

3. **Get AWS Credentials**
   - Create or obtain your AWS credentials (Access Key ID, Secret Access Key, and optionally, a Session Token).

4. **Configure the Code**
   - Copy the region, access key ID, secret access key, session token, and queue URL into the code at `src/index.ts`.

   ```typescript
   const client = new SQSClient({
       region: "<region>",
       credentials: {
           accessKeyId: "<accessKeyId>",
           secretAccessKey: "<secretAccessKey>",
           sessionToken: "<sessionToken>"
       },
   });

   const params = {
       MessageBody: 'This is a test message with SQSClient.',
       QueueUrl: '<queueUrl>'
   };

## Building and Running the Example

```bash
spin build
spin up
```

Use e.g. curl -v http://127.0.0.1:3000/ to test the endpoint.
