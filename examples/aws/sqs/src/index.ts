import { ResponseBuilder } from '@fermyon/spin-sdk';
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

export async function handler(_req: Request, res: ResponseBuilder) {
  const command = new SendMessageCommand(params);
  try {
    await client.send(command);
    res.send('success');
  } catch (e: any) {
    res.status(500);
    res.send(`error : ${e.message}`);
  }
}
