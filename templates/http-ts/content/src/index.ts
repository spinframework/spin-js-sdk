declare const spinSdk: any;

const encoder = new TextEncoder()

export async function handleRequest(_request: any) {

    return {
        status: 200,
        headers: { "foo": "bar" },
        body: encoder.encode("Hello from JS-SDK").buffer
    }
}
