# Using the Router

This example showcases utilizing the `itty-router` to respond to requests on different paths. 

## Building and Running the Example

```bash
spin build
spin up
```

To test the different routes, run the following commands:

```bash
curl localhost:3000/
# hello universe
curl localhost:3000/hello/spin
# Hello spin
```
