# Upstash QStash Integration

This example demonstrates how to connect to Upstash QStash, publish a JSON message with a delay, and handle an HTTP request using the Spin SDK.

## Install Dependencies
Install the necessary npm packages:

```bash
npm install
```

## Setup the Example

1. **Create an Upstash Account**
   - If you don't have an Upstash account, create one at [Upstash](https://upstash.com/).

2. **Get QStash Token**
   - Go to the Upstash dashboard and obtain your QStash token.

3. **Configure the Code**
   - Copy the API URL and token into the code at `src/index.ts`. 
    ```js
    const client = new Client({ token: "<qstash-token>" });
    
    ...

    const resp = await client.publishJSON({
        url: "<target-url>",
        body: { hello: "world" },
        delay: 2,
    });
    ```

## Building and Running the Example

```bash
spin build
spin up
```

Use e.g. curl -v http://127.0.0.1:3000/ to test the endpoint.
