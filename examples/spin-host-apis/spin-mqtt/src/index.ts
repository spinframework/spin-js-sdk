import { ResponseBuilder, Mqtt } from '@fermyon/spin-sdk';
import { QoS } from '@fermyon/spin-sdk/lib/mqtt';

const encoder = new TextEncoder();

const config = {
  address: '<mqtt-broker-address>',
  username: '<mqtt-broker-username>',
  password: '<mqtt-broker-password>',
  KeepAlive: 60,
};

const topic = '<mqtt-topic>';

export async function handler(_req: Request, res: ResponseBuilder) {
  let conn = Mqtt.open(
    config.address,
    config.username,
    config.password,
    config.KeepAlive,
  );
  conn.publish(topic, encoder.encode('message'), QoS.AtMostOnce);

  res.send('Message published successfully');
}
