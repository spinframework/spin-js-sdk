import * as Mysql from "@spinframework/spin-mysql";

const MYSQL_CONNECTION = "mysql://root:root@127.0.0.1/spin_test";

/**
 * MySQL test - integer type conversion
 */
export function mysqlTestInteger(req: Request) {
    try {
        const conn = Mysql.open(MYSQL_CONNECTION);
        const result = conn.query("SELECT 42 as value", []);
        
        const value = result.rows[0].value;
        if (result.rows.length === 1 && typeof value === 'bigint' && value === 42n) {
            return new Response("success", { status: 200 });
        }
        return new Response(`failed: expected typeof bigint and value 42n, got typeof ${typeof value} and value ${value}`, { status: 500 });
    } catch (error: any) {
        return new Response(`failed: ${error.message || JSON.stringify(error) || error}`, { status: 500 });
    }
}

/**
 * MySQL test - text/string type conversion
 */
export function mysqlTestText(req: Request) {
    try {
        const conn = Mysql.open(MYSQL_CONNECTION);
        const result = conn.query("SELECT 'hello world' as value", []);
        
        if (result.rows.length === 1 && typeof result.rows[0].value === 'string' && result.rows[0].value === 'hello world') {
            return new Response("success", { status: 200 });
        }
        return new Response(`failed: expected typeof string and value 'hello world', got typeof ${typeof result.rows[0]?.value} and value ${result.rows[0]?.value}`, { status: 500 });
    } catch (error: any) {
        return new Response(`failed: ${error.message || JSON.stringify(error) || error}`, { status: 500 });
    }
}

/**
 * MySQL test - NULL type handling
 */
export function mysqlTestNull(req: Request) {
    try {
        const conn = Mysql.open(MYSQL_CONNECTION);
        const result = conn.query("SELECT NULL as null_value, 'test' as text_value", []);
        
        if (result.rows.length === 1 && 
            result.rows[0].null_value === null &&
            typeof result.rows[0].text_value === 'string') {
            return new Response("success", { status: 200 });
        }
        return new Response(`failed: null_value type=${typeof result.rows[0]?.null_value}, text_value type=${typeof result.rows[0]?.text_value}`, { status: 500 });
    } catch (error: any) {
        return new Response(`failed: ${error.message || JSON.stringify(error) || error}`, { status: 500 });
    }
}

/**
 * MySQL test - parameterized query type conversions
 */
export function mysqlTestParams(req: Request) {
    try {
        const conn = Mysql.open(MYSQL_CONNECTION);
        const result = conn.query("SELECT ? as int_val, ? as text_val, ? as bool_val", [42, "test", true]);
        
        const intVal = result.rows[0].int_val;
        const textVal = result.rows[0].text_val;
        const boolVal = result.rows[0].bool_val;
        
        if (result.rows.length === 1 && 
            typeof intVal === 'bigint' && intVal === 42n &&
            typeof textVal === 'string' && textVal === 'test' &&
            typeof boolVal === 'bigint' && (boolVal === 1n || boolVal === 0n)) {
            return new Response("success", { status: 200 });
        }
        return new Response(`failed: int_val=${intVal} (${typeof intVal}), text_val=${textVal} (${typeof textVal}), bool_val=${boolVal} (${typeof boolVal})`, { status: 500 });
    } catch (error: any) {
        return new Response(`failed: ${error.message || JSON.stringify(error) || error}`, { status: 500 });
    }
}
