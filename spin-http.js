function handleRequest(request) {
    return {
        status: 200,
        headers: {
            foo: "bar"
        },
        body: `${spin.config.get("message")}\n`
    }
}
