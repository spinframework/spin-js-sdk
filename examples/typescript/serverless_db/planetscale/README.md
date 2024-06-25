# Planetscale Database Integration

This example demonstrates how to connect to Neon Database using the Planetscale Database SDK, execute a SQL query, and handle responses using the Spin SDK.

## Install Dependencies
Install the necessary npm packages:

```bash
npm install
```

## Setup the Example

1. **Setup Neon Database**
   - Ensure you have access to a Database instance from [Planetscale](https://planetscale.com/).

2. **Configure the Code**
   - Copy the Planetscale host, username and password into the code at `src/index.ts`.
   
    ```js
   const config = {
      host: '<host>',
      username: '<username>',
      password: '<password>'
   }
    ```

## Building and Running the Example

```bash
spin build
spin up
```

Use e.g. curl -v http://127.0.0.1:3000/ to test the endpoint.