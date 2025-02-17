# Using the Router

This example showcases utilizing the `itty-router` to respond to requests on different paths. 

## Building and Running the Example

```bash
spin build
spin up
```

## Testing Endpoints

To test the different endpoints registered using the `itty-router`, run the following commands:

### Sending a `GET` request to `/` 

```console
curl localhost:3000/
# Hello, Fermyon
```

### Sending a `GET` request to `/hello/:name`

```console
# Passing "Spin" for the route parameter :name
curl localhost:3000/hello/Spin
# Hello, Spin
```

### Sending a `GET` request to `/bye/:name`

```console
# Passing "Spin" for the route parameter :name 
curl localhost:3000/bye/Spin
# {"message": "Goodbye, Spin"}
```

### Sending a `GET` request to `/reverse-header-value`

```console
# Specifying the x-spin-demo header and printing response headers
curl -i -H 'x-spin-demo:hello spin' localhost:3000/reverse-header-value
# HTTP/1.1 200 OK
# x-spin-demo: nips olleh
# content-length: 0
# date: Mon, 17 Feb 2025 13:52:52 GMT
```

### Sending a `POST` request to `/items`

```console
# Passing a JSON payload
curl -XPOST -H 'content-type:application/json' -d '{ "message": "hello"}' localhost:3000/items
# Item stored
```
