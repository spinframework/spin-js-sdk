import * as Postgres from "@spinframework/spin-postgres";

const POSTGRES_CONNECTION = "host=localhost port=5432 user=postgres password=postgres dbname=spin_test sslmode=disable";

/**
 * Postgres test - integer type conversion
 */
export function postgresTestInteger(req: Request) {
    try {
        const conn = Postgres.open(POSTGRES_CONNECTION);
        const result = conn.query("SELECT 42 as value", []);
        
        if (result.rows.length === 1 && typeof result.rows[0].value === 'number' && result.rows[0].value === 42) {
            return new Response("success", { status: 200 });
        }
        return new Response(`failed: expected typeof number and value 42, got typeof ${typeof result.rows[0]?.value} and value ${result.rows[0]?.value}`, { status: 500 });
    } catch (error: any) {
        return new Response(`failed: ${error.message || error}`, { status: 500 });
    }
}

/**
 * Postgres test - text/string type conversion
 */
export function postgresTestText(req: Request) {
    try {
        const conn = Postgres.open(POSTGRES_CONNECTION);
        const result = conn.query("SELECT 'hello world'::text as value", []);
        
        if (result.rows.length === 1 && typeof result.rows[0].value === 'string' && result.rows[0].value === 'hello world') {
            return new Response("success", { status: 200 });
        }
        return new Response(`failed: expected typeof string and value 'hello world', got typeof ${typeof result.rows[0]?.value} and value ${result.rows[0]?.value}`, { status: 500 });
    } catch (error: any) {
        return new Response(`failed: ${error.message || error}`, { status: 500 });
    }
}

/**
 * Postgres test - boolean type conversion
 */
export function postgresTestBoolean(req: Request) {
    try {
        const conn = Postgres.open(POSTGRES_CONNECTION);
        const result = conn.query("SELECT true as val_true, false as val_false", []);
        
        if (result.rows.length === 1 && 
            typeof result.rows[0].val_true === 'boolean' && result.rows[0].val_true === true &&
            typeof result.rows[0].val_false === 'boolean' && result.rows[0].val_false === false) {
            return new Response("success", { status: 200 });
        }
        return new Response(`failed: val_true=${result.rows[0]?.val_true} (${typeof result.rows[0]?.val_true}), val_false=${result.rows[0]?.val_false} (${typeof result.rows[0]?.val_false})`, { status: 500 });
    } catch (error: any) {
        return new Response(`failed: ${error.message || error}`, { status: 500 });
    }
}

/**
 * Postgres test - float/numeric type conversion
 */
export function postgresTestFloat(req: Request) {
    try {
        const conn = Postgres.open(POSTGRES_CONNECTION);
        const result = conn.query("SELECT 3.14::float as value", []);
        
        if (result.rows.length === 1 && 
            typeof result.rows[0].value === 'number') {
            return new Response("success", { status: 200 });
        }
        return new Response(`failed: expected 3.14 (number), got ${result.rows[0]?.value} (${typeof result.rows[0]?.value})`, { status: 500 });
    } catch (error: any) {
        return new Response(`failed: ${error.message || error}`, { status: 500 });
    }
}

/**
 * Postgres test - NULL type handling
 */
export function postgresTestNull(req: Request) {
    try {
        const conn = Postgres.open(POSTGRES_CONNECTION);
        const result = conn.query("SELECT NULL as null_value, 'test' as text_value", []);
        
        if (result.rows.length === 1 && 
            result.rows[0].null_value === null &&
            typeof result.rows[0].text_value === 'string') {
            return new Response("success", { status: 200 });
        }
        return new Response(`failed: null_value type=${typeof result.rows[0]?.null_value}, text_value type=${typeof result.rows[0]?.text_value}`, { status: 500 });
    } catch (error: any) {
        return new Response(`failed: ${error.message || error}`, { status: 500 });
    }
}

/**
 * Postgres test - parameterized query type conversions
 */
export function postgresTestParams(req: Request) {
    try {
        const conn = Postgres.open(POSTGRES_CONNECTION);
        const result = conn.query("SELECT $1::int as int_val, $2::text as text_val, $3::bool as bool_val", [42, "test", true]);
        
        if (result.rows.length === 1 && 
            typeof result.rows[0].int_val === 'number' && result.rows[0].int_val === 42 &&
            typeof result.rows[0].text_val === 'string' && result.rows[0].text_val === 'test' &&
            typeof result.rows[0].bool_val === 'boolean' && result.rows[0].bool_val === true) {
            return new Response("success", { status: 200 });
        }
        return new Response(`failed: int_val=${result.rows[0]?.int_val} (${typeof result.rows[0]?.int_val}), text_val=${result.rows[0]?.text_val} (${typeof result.rows[0]?.text_val}), bool_val=${result.rows[0]?.bool_val} (${typeof result.rows[0]?.bool_val})`, { status: 500 });
    } catch (error: any) {
        return new Response(`failed: ${error.message || error}`, { status: 500 });
    }
}

/**
 * Postgres test - NULL values handling
 */
export function postgresTestNullValues(req: Request) {
    try {
        const conn = Postgres.open(POSTGRES_CONNECTION);
        
        // Setup
        conn.execute("DROP TABLE IF EXISTS test_nullable CASCADE", []);
        conn.execute(`
            CREATE TABLE test_nullable (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                optional_field VARCHAR(255)
            )
        `, []);
        
        // Insert with NULL
        conn.execute(
            "INSERT INTO test_nullable (name, optional_field) VALUES ($1, $2)",
            ["Test", null]
        );
        
        // Select and verify NULL
        const result = conn.query(
            "SELECT name, optional_field FROM test_nullable WHERE name = $1",
            ["Test"]
        );
        
        if (result.rows.length === 1 &&
            result.rows[0].name === "Test" &&
            (result.rows[0].optional_field === null || result.rows[0].optional_field === "")) {
            return new Response("success", { status: 200 });
        }
        return new Response("failed: NULL handling test failed", { status: 500 });
    } catch (error) {
        return new Response(`failed: ${error}`, { status: 500 });
    }
}
