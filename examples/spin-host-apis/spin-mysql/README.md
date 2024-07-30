# Using Spin Outbound MySQL

This example showcases using outbound MySQL with the Spin SDK.

## Install Dependencies
Install the necessary npm packages:

```bash
npm install
```

## Building and Running the Example

Setup the MySQL database instance running at `127.0.0.1`. Run the following commands after connecting to it:

```bash
create database spin_dev;
use spin_dev;
create table test(id int, val int);
insert into test values (4,4);
```

Build and run the app:

```bash
spin build
spin up
```

Use e.g. `curl -v http://127.0.0.1:3000/` to test the endpoint.
