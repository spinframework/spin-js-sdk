import * as Sqlite from "@spinframework/spin-sqlite";

/**
 * SQLite test - integer type conversion
 */
export function sqliteTestInteger(req: Request) {
    try {
        const conn = Sqlite.open("default");
        const result = conn.execute("SELECT 42 as value", []);
        
        if (result.rows.length === 1 && typeof result.rows[0].value === 'bigint' && result.rows[0].value === 42n) {
            return new Response("success", { status: 200 });
        }
        return new Response(`failed: expected typeof bigint and value 42n, got typeof ${typeof result.rows[0]?.value} and value ${result.rows[0]?.value}`, { status: 500 });
    } catch (error) {
        return new Response(`failed: ${error}`, { status: 500 });
    }
}

/**
 * SQLite test - text/string type conversion
 */
export function sqliteTestText(req: Request) {
    try {
        const conn = Sqlite.open("default");
        const result = conn.execute("SELECT 'hello world' as value", []);
        
        if (result.rows.length === 1 && typeof result.rows[0].value === 'string' && result.rows[0].value === 'hello world') {
            return new Response("success", { status: 200 });
        }
        return new Response(`failed: expected typeof string and value 'hello world', got typeof ${typeof result.rows[0]?.value} and value ${result.rows[0]?.value}`, { status: 500 });
    } catch (error) {
        return new Response(`failed: ${error}`, { status: 500 });
    }
}

/**
 * SQLite test - real/float type conversion
 */
export function sqliteTestReal(req: Request) {
    try {
        const conn = Sqlite.open("default");
        const result = conn.execute("SELECT 3.14 as value", []);
        
        if (result.rows.length === 1 && 
            typeof result.rows[0].value === 'number') {
            return new Response("success", { status: 200 });
        }
        return new Response(`failed: expected typeof number and value ~3.14, got typeof ${typeof result.rows[0]?.value} and value ${result.rows[0]?.value}`, { status: 500 });
    } catch (error) {
        return new Response(`failed: ${error}`, { status: 500 });
    }
}

/**
 * SQLite test - NULL value handling
 */
export function sqliteTestNull(req: Request) {
    try {
        const conn = Sqlite.open("default");
        const result = conn.execute("SELECT NULL as null_val, 'test' as text_val", []);
        
        // SQLite may return NULL as null or undefined
        if (result.rows.length === 1 && 
            (result.rows[0].null_val === null || result.rows[0].null_val === undefined) && 
            typeof result.rows[0].text_val === 'string') {
            return new Response("success", { status: 200 });
        }
        return new Response(`failed: null_val type=${typeof result.rows[0]?.null_val}, text_val type=${typeof result.rows[0]?.text_val}`, { status: 500 });
    } catch (error) {
        return new Response(`failed: ${error}`, { status: 500 });
    }
}

/**
 * SQLite test - parameterized query type conversion
 */
export function sqliteTestParams(req: Request) {
    try {
        const conn = Sqlite.open("default");
        const result = conn.execute("SELECT ? as int_val, ? as text_val", [42, "test"]);
        
        if (result.rows.length === 1 && 
            typeof result.rows[0].int_val === 'bigint' && result.rows[0].int_val === 42n &&
            typeof result.rows[0].text_val === 'string' && result.rows[0].text_val === 'test') {
            return new Response("success", { status: 200 });
        }
        return new Response(`failed: int_val=${result.rows[0]?.int_val} (${typeof result.rows[0]?.int_val}), text_val=${result.rows[0]?.text_val} (${typeof result.rows[0]?.text_val})`, { status: 500 });
    } catch (error) {
        return new Response(`failed: ${error}`, { status: 500 });
    }
}
