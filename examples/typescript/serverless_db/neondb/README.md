# Neon Database Integration

This example demonstrates how to connect to Neon Database using the Neon Serverless SDK, execute a SQL query, and handle responses using the Spin SDK.

## Install Dependencies
Install the necessary npm packages:

```bash
npm install
```

## Setup the Example

1. **Setup Neon Database**
   - Ensure you have access to a Neon Database instance from [Neon](https://neon.tech/).

2. **Configure the Code**
   - Copy the Neon Database endpoint into the code at `src/index.ts`.
   
    ```js
    const sql = neon('<neon-database-endpoint>');
    ```

## Building and Running the Example

```bash
spin build
spin up
```

Use e.g. curl -v http://127.0.0.1:3000/ to test the endpoint.