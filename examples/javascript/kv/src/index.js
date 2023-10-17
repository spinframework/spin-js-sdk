import { Router, Kv } from '@fermyon/spin-sdk'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

let router = new Router()

router.get("/", getAll)
router.get("/json/:key", ({ params }) => getJson(params.key))
router.post("/json/:key", ({ params }, body) => setJson(params.key, body))
router.get("/:key", ({ params }) => getByKey(params.key))
router.post("/:key", ({ params }, body) => set(params.key, body))
router.delete("/:key", ({ params }) => deleteByKey(params.key))
router.all("*", notFound)

/// returns all keys and values form the key-value store
function getAll() {
    const store = Kv.openDefault()
    const keys = store.getKeys()
    let body = {}
    for (let key of keys) {
        body[key] = decoder.decode(store.get(key))
    }
    return {
        status: 200,
        body: encoder.encode(JSON.stringify(body))
    }
}

/// returns a JSON value from the store
function getJson(key) {
    const store = Kv.openDefault()
    if (!store.exists(key)) {
        return notFound()
    }
    let model = null;
    try {
        model = store.getJson(key)
    }
    catch (e) {
        return {
            status: 400,
            body: encoder.encode("Key holds a non-JSON value")
        }
    }
    return {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        },
        body: encoder.encode(JSON.stringify(model))
    }
}

/// sets a JSON value in the store
function setJson(key, body) {
    const store = Kv.openDefault()
    const model = JSON.parse(decoder.decode(body))
    store.setJson(key, model)
    return {
        status: 201,
        headers: {
            "Location": `/${key}`
        },
        body: decoder.decode(JSON.stringify({
            key,
            value: model
        }))
    }
}

/// returns a value by its key
function getByKey(key) {
    const store = Kv.openDefault()
    if (!store.exists(key)) {
        return notFound()
    }
    const value = store.get(key);
    return {
        status: 200,
        body: decoder.decode(value)
    }
}

/// adds a value to the store for a given key
function set(key, body) {
    const store = Kv.openDefault()
    const model = JSON.parse(decoder.decode(body))

    if (!model.hasOwnProperty("value")) {
        return {
            status: 400,
            body: encoder.encode("Value is required")
        }
    }
    store.set(key, model.value)
    return {
        status: 201,
        headers: {
            "Location": `/${key}`
        },
        body: decoder.decode(JSON.stringify({
            key,
            value: model.value
        }))
    }
}

/// deletes a value from the store
function deleteByKey(key) {
    const store = Kv.openDefault()
    if (!store.exists(key)) {
        return notFound()
    }

    store.delete(key)
    return {
        status: 204
    }
}

/// returns a 404 response
function notFound() {
    return {
        status: 404,
        body: encoder.encode("Not Found")
    }
}

export async function handleRequest(req) {
    return await router.handleRequest(req, req.body)
}
