# Using Outbound HTTP

This example showcases making an outbound HTTP request and returning the response.

## Configuring `allowed_outbound_hosts` in `spin.toml`

The `allowed_outbound_hosts` needs to include the address of the host to which the guest tried to call. In the case of this example, the host is `https://random-data-api.fermyon.app/` which is added in the `spin.toml`

## Building and Running the Example

```bash
spin build
spin up
```

Use e.g. `curl -v http://127.0.0.1:3000/` to test the endpoint.
