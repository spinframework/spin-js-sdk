function fetch(uri, options) {
    const { status, headers, body } = spinSdk.http.send({
        method: (options && options.method) || "GET",
        uri,
        ...(options || {})
    })

    return Promise.resolve({
        status,
        headers: {
            entries: () => Object.entries(headers)
        },
        arrayBuffer: () => Promise.resolve(body)
    })
}
