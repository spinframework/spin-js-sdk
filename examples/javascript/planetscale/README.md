## Planetscale integration

This example showcases connecting and querying planetscaleDB

### Setup the example

- Create an account on planetscale
- Create a database
- In the database's **Settings > Beta features** section, enroll the database into **PlanetScale serverless driver for JavaScript** beta.

Copy the **host**, **username** and **password** from the overview page using the **Connect** button and select “@planetscale/database” from the “Connect with” dropdown. Add these credentials into the code at `src/index.js`.

```
.
.
.
const config = {
   host: '<host>',
   username: '<username>',
   password: '<password>'
}
.
.
.
```

### Building the example

```
npm install
npm run build
```

### Running the example

```
spin up --follow-all
```

Use e.g. `curl -v http://127.0.0.1:3000/hello` to test that it's working.