const encoder = new TextEncoder("utf-8");

export async function handleRequest(request) {
    const conn = spinSdk.sqlite.openDefault();
    const result = conn.execute("SELECT * FROM todos WHERE id > (?);", [1]);

    return {
        status: 200,
        body: encoder.encode(JSON.stringify(result.rows)).buffer
    }
}
