# Upstash Vector Integration

This example showcases how to connect to Upstash Vector, upsert vectors, and perform a query using the Upstash SDK.

## Install Dependencies
Install the necessary npm packages:

```bash
npm install
```

## Setup the Example

1. **Create an Upstash Account**
   - If you don't have an Upstash account, create one at [Upstash](https://upstash.com/).

2. **Create a Vector Index**
   - Go to the Upstash dashboard and create a new vector index.
   - Note down the index URL and token.

3. **Configure the Code**
   - Copy the index URL and token into the code at `src/index.ts`.

    ```ts
    const index = new Index({
       url: "<index-url>",
       token: "<index-token>"
    })
    ```

## Building and Running the Example

```bash
spin build
spin up
```

Use e.g. `curl -v http://127.0.0.1:3000/` to test the endpoint.
