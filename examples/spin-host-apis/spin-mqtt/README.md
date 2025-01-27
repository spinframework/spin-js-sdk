# Using Spin Outbound MQTT

This example showcases using outbound MQTT with the Spin SDK.

## Building and Running the Example

For this example, configure the app with the address, username password and topics in `src/index.ts`:

```js
const config = {
  address: "<mqtt-broker-address>",
  username: "<mqtt-broker-username>",
  password: "<mqtt-broker-password>",
  KeepAlive: 60,
}

const topic = "<mqtt-topic>";
```

Build and run the app:

```bash
spin build
spin up
```

Use e.g. `curl -v http://127.0.0.1:3000/` to test the endpoint.
