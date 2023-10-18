# `spin-js-sdk` HTTP router sample

This app demonstrates how one can use the built-in router in JavaScript to address routing concerns.

The app exposes the following endpoints:

- `GET /ok`: Endpoint that will always return HTTP 200
- `GET /echo/:value?`: Endpoint with an optional route parameter (`:value?`)
- `POST /format-json`: Endpoint that relies on the request payload to build the response
- `POST /start-job`: Endpoint that uses a middleware
- `* /*`: a catch-all route that always returns HTTP 404

## Build and run the app locally

To build and run the app locally, you can either use `spin build` and `spin up` or combine both commands and simply run `spin build --up`.
