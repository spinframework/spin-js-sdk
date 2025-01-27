# Using Spin Outbound PostgreSQL

This example showcases using outbound PostgreSQL with the Spin SDK.

## Building and Running the Example

Setup the PostgreSQL database instance running at `127.0.0.1`. Run the following commands after connecting to it:

```bash
create database spin_dev;
\c spin_dev;
create table test(id int, val int);
insert into test values (4,4);
```

Build and run the app:

```bash
spin build
spin up
```

Use e.g. `curl -v http://127.0.0.1:3000/` to test the endpoint.
