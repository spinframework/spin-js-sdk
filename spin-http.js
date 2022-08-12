function handleRequest(request) {
    return {
        status: 200,
        headers: {
            foo: "bar"
        },
        body: "Hello, Fermyon!\n"
    }
}
