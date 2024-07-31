# Using the Router

This example showcases utilizing the `router` to respond to requests on different paths. 

## Install Dependencies
Install the necessary npm packages:

```bash
npm install
```

## Building and Running the Example

```bash
spin build
spin up
```

To test the different routes, run the following commands:

```bash
curl localhost:3000/
# Hello from default route
curl localhost:3000/home/123
# Hello from home route with id: 123
```
