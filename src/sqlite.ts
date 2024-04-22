//@ts-ignore
import * as spinSqlite from "fermyon:spin/sqlite@2.0.0"

export type sqliteValues = ValueInteger | ValueReal | ValueText | ValueBlob | ValueNull
export type ParameterValue = sqliteValues | number | bigint | null | string | Uint8Array
type SqliteRowResultItem = { tag: string, val: number | bigint | string | Uint8Array | null }
type SqliteRowResult = { values: SqliteRowResultItem[] }
export type ValueInteger = { tag: "integer", val: number | bigint }
export type ValueReal = { tag: "real", val: number | bigint }
export type ValueText = { tag: "text", val: string }
export type ValueBlob = { tag: "blob", val: Uint8Array }
export type ValueNull = { tag: "null" }

interface SpinSqliteResult {
    columns: string[]
    rows: SqliteRowResult[]
}

export interface SqliteResult {
    columns: string[]
    rows: { [key: string]: number | bigint | null | string | Uint8Array }[]
}

export interface SpinSqliteConnection {
    execute: (statement: string, parameters: ParameterValue[]) => SqliteResult
}

function createSqliteConnection(connection: spinSqlite.Connection): SpinSqliteConnection {
    return {
        execute: (statement: string, parameters: ParameterValue[]): SqliteResult => {
            let santizedParams = convertToWitTypes(parameters)
            let ret = connection.execute(statement, santizedParams) as SpinSqliteResult
            let results: SqliteResult = {
                columns: ret.columns,
                rows: []
            }
            ret.rows.map((k: SqliteRowResult, rowIndex: number) => {
                results.rows.push({})
                k.values.map((val, valIndex: number) => {
                    results.rows[rowIndex][results.columns[valIndex]] = val.val
                })
            })
            return results
        }
    }
}

export const Sqlite = {
    open: (label: string): SpinSqliteConnection => {
        return createSqliteConnection(spinSqlite.Connection.open(label))
    },
    openDefault: (): SpinSqliteConnection => {
        return createSqliteConnection(spinSqlite.Connection.open("default"))
    }
}

export const valueInteger = (value: number | bigint): ValueInteger => {
    return { tag: "integer", val: value }
}

export const valueReal = (value: number | bigint): ValueReal => {
    return { tag: "real", val: value }
}

export const valueText = (value: string): ValueText => {
    return { tag: "text", val: value }
}

export const valueBlob = (value: Uint8Array): ValueBlob => {
    return { tag: "blob", val: value }
}

export const valueNull = (): ValueNull => {
    return { tag: "null" }
}

function convertToWitTypes(parameters: ParameterValue[]): sqliteValues[] {
    let sanitized: sqliteValues[] = []
    for (let k of parameters) {
        if (typeof (k) === "object") {

            sanitized.push(k as sqliteValues)
            continue
        }
        if (typeof (k) === "number") {
            isFloat(k) ? sanitized.push(valueReal(k)) : sanitized.push(valueInteger(k))
            continue
        }
        if (typeof (k) === "bigint") {
            sanitized.push(valueInteger(k))
            continue
        }
        if (typeof (k) === "string") {
            sanitized.push(valueText(k))
            continue
        }
        if (k === null) {
            sanitized.push(valueNull())
            continue
        }
        if (k as any instanceof Uint8Array) {
            sanitized.push(valueBlob(k));
            continue;
        }
    }
    return sanitized
}

function isFloat(number: number) {
    return number % 1 !== 0;
}
