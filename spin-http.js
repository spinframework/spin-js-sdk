function handleRequest(request) {
    let dogFact = spin.http.send({
        method: "GET",
        uri: "https://some-random-api.ml/facts/dog",
    })

    return {
        status: 200,
        headers: {
            foo: "bar"
        },
        body: `${spin.config.get("message")}\nHere's a dog fact: ${JSON.stringify(dogFact)}\n`
    }
}
