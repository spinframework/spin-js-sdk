import { ResponseBuilder, Sqlite } from "@fermyon/spin-sdk";

export async function handler(req: Request, res: ResponseBuilder) {
    let conn = Sqlite.openDefault();
    let result = conn.execute("SELECT * FROM todos WHERE id > (?);", [1]);

    res.send(JSON.stringify(result));
}