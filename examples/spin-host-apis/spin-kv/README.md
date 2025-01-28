# Using Spin KV

This is a simple example showcasing using Spin key-value storage with TypeScript.

###  Building and Running

To build the app run the following commands:

```bash
$ spin build --up
```

The mapping between the request method and KV operation is as follows:
```bash
GET -> kv.get(request.url)
POST -> kv.set(request.uri, body)
HEAD -> kv.exists(request.uri)
DELETE -> kv.delete(request.uri)
```

The application can now receive requests on `http://localhost:3000`:

```bash
$ curl -i -X POST -d "ok" localhost:3000/test
HTTP/1.1 200 OK
content-length: 0
date: Tue, 25 Apr 2023 14:25:43 GMT

$ curl -i -X GET localhost:3000/test
HTTP/1.1 200 OK
content-length: 3
date: Tue, 25 Apr 2023 14:25:54 GMT

ok!

$ curl -i -X DELETE localhost:3000/test
HTTP/1.1 200 OK
content-length: 0
date: Tue, 25 Apr 2023 14:26:30 GMT

$ curl -i -X GET localhost:3000/test
HTTP/1.1 404 Not Found
content-length: 0
date: Tue, 25 Apr 2023 14:31:53 GMT
```
