# `spin-js-sdk` key-value sample

This app demonstrates how to use key-value store APIs with the Spin JavaScript SDK (`spin-js-sdk`).

The app exposes several endpoints using an HTTP trigger:

- `GET /`: Retrieve all keys and values from the store
- `GET /json/:key`: Retrieve a JSON value from the store using its key
- `SET /json/:key`: Stores the entire request payload as JSON for the given key
- `GET /:key`: Retrieve a plain value from the store using its key
- `SET /:key`: Stores the `value` property of the payload as plain text in key-value store
- `DELETE /:key`: Removes a value from the key-value store by its key

The app leverages the `default` key-value store as specified in `spin.toml`.

## Build and run the app locally

To build and run the app locally, you can either use `spin build` and `spin up` or combine both commands and simply run `spin build --up`.
