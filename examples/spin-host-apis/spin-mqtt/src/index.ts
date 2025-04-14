// https://itty.dev/itty-router/routers/autorouter
import { AutoRouter } from 'itty-router';
import { Mqtt, QoS } from '@spinframework/spin-mqtt';

const encoder = new TextEncoder();

const config = {
    address: '<mqtt-broker-address>',
    username: '<mqtt-broker-username>',
    password: '<mqtt-broker-password>',
    KeepAlive: 60,
};

const topic = '<mqtt-topic>';

let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get("/", () => {
        let conn = Mqtt.open(
            config.address,
            config.username,
            config.password,
            config.KeepAlive,
        );
        conn.publish(topic, encoder.encode('message'), QoS.AtMostOnce);

        return new Response('Message published successfully');
    })

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});
