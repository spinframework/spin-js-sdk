export type sqliteValues = ValueInteger | ValueReal | ValueText | ValueBlob | ValueNull;
export type SqliteRowResult = sqliteValues[];
export type ValueInteger = {
    tag: "integer";
    val: number;
};
export type ValueReal = {
    tag: "real";
    val: number;
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
    rows: SqliteRowResult[];
}
export interface SpinSqliteConnection {
    execute: (statement: string, parameters: sqliteValues[]) => SqliteResult;
}
export declare const Sqlite: {
    open: (label: string) => SpinSqliteConnection;
    openDefault: () => SpinSqliteConnection;
};
export declare const valueInteger: (value: number) => ValueInteger;
export declare const valueReal: (value: number) => ValueReal;
export declare const valueText: (value: string) => ValueText;
export declare const valueBlob: (value: Uint8Array) => ValueBlob;
export declare const valueNull: () => ValueNull;
