# Drizzle ORM Integration

This example showcases how to use [Drizzle ORM](https://orm.drizzle.team/) to generate database queries and execute it against Spin's SQLite database. 

## Install Dependencies
Install the necessary npm packages:

```bash
npm install
```

## Building and Running the Example

```bash
spin build
spin up --sqlite @migrations.sql
```

Use e.g. `curl -v http://127.0.0.1:3000/` to test the endpoint.
