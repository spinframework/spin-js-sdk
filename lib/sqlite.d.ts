export type sqliteValues = ValueInteger | ValueReal | ValueText | ValueBlob | ValueNull;
export type ParameterValue = sqliteValues | number | bigint | null | string | Uint8Array;
type SqliteRowResultItem = {
    tag: string;
    val: number | bigint | string | Uint8Array | null;
};
export type SqliteRowResult = {
    values: SqliteRowResultItem[];
};
export type ValueInteger = {
    tag: "integer";
    val: number | bigint;
};
export type ValueReal = {
    tag: "real";
    val: number | bigint;
};
export type ValueText = {
    tag: "text";
    val: string;
};
export type ValueBlob = {
    tag: "blob";
    val: Uint8Array;
};
export type ValueNull = {
    tag: "null";
};
export interface SqliteResult {
    columns: string[];
    rows: {
        [key: string]: number | bigint | null | string | Uint8Array;
    }[];
}
export interface SpinSqliteConnection {
    execute: (statement: string, parameters: ParameterValue[]) => SqliteResult;
}
export declare const Sqlite: {
    open: (label: string) => SpinSqliteConnection;
    openDefault: () => SpinSqliteConnection;
};
export declare const valueInteger: (value: number | bigint) => ValueInteger;
export declare const valueReal: (value: number | bigint) => ValueReal;
export declare const valueText: (value: string) => ValueText;
export declare const valueBlob: (value: Uint8Array) => ValueBlob;
export declare const valueNull: () => ValueNull;
export {};
