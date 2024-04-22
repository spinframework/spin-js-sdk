//@ts-ignore
import * as spinPg from "fermyon:spin/postgres@2.0.0";
function createPostgresConnection(connection) {
    return {
        query: (statement, params) => {
            let santizedParams = convertRdbmsToWitTypes(params);
            let ret = connection.query(statement, santizedParams);
            let results = {
                columns: ret.columns,
                rows: []
            };
            ret.rows.map((k, rowIndex) => {
                results.rows.push({});
                k.map((val, valIndex) => {
                    results.rows[rowIndex][results.columns[valIndex].name] = (val.tag == "db-null" || val.tag == "unsupported") ? null : val.val;
                });
            });
            return results;
        },
        execute: (statement, params) => {
            let santizedParams = convertRdbmsToWitTypes(params);
            let ret = connection.execute(statement, santizedParams);
            return ret;
        }
    };
}
export const Postgres = {
    open: (address) => {
        return createPostgresConnection(spinPg.Connection.open(address));
    }
};
function convertRdbmsToWitTypes(parameters) {
    let sanitized = [];
    for (let k of parameters) {
        if (typeof (k) === "object") {
            sanitized.push(k);
            continue;
        }
        if (typeof (k) === "string") {
            sanitized.push({ tag: "str", val: k });
            continue;
        }
        if (typeof (k) === null) {
            sanitized.push({ tag: "db-null" });
            continue;
        }
        if (typeof (k) === "boolean") {
            sanitized.push({ tag: "boolean", val: k });
            continue;
        }
        if (typeof (k) === "bigint") {
            sanitized.push({ tag: "int64", val: k });
            continue;
        }
        if (typeof (k) === "number") {
            isFloat(k) ? sanitized.push({ tag: "floating64", val: k }) : sanitized.push({ tag: "int32", val: k });
            continue;
        }
        if (k instanceof Uint8Array) {
            sanitized.push({ tag: "binary", val: k });
            continue;
        }
    }
    return sanitized;
}
function isFloat(number) {
    return number % 1 !== 0;
}
