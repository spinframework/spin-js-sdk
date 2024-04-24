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

export interface SqliteConnection {
    execute: (statement: string, parameters: ParameterValue[]) => SqliteResult
}

function createSqliteConnection(connection: spinSqlite.Connection): SqliteConnection {
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

export function open(label: string): SqliteConnection {
    return createSqliteConnection(spinSqlite.Connection.open(label))
}
export function openDefault(): SqliteConnection {
    return createSqliteConnection(spinSqlite.Connection.open("default"))
}

const valueInteger = (value: number | bigint): ValueInteger => {
    return { tag: "integer", val: value }
}

const valueReal = (value: number | bigint): ValueReal => {
    return { tag: "real", val: value }
}

const valueText = (value: string): ValueText => {
    return { tag: "text", val: value }
}

const valueBlob = (value: Uint8Array): ValueBlob => {
    return { tag: "blob", val: value }
}

const valueNull = (): ValueNull => {
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
