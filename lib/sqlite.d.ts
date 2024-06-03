export type sqliteValues = ValueInteger | ValueReal | ValueText | ValueBlob | ValueNull;
export type ParameterValue = sqliteValues | number | bigint | null | string | Uint8Array;
export type ValueInteger = {
    tag: 'integer';
    val: number | bigint;
};
export type ValueReal = {
    tag: 'real';
    val: number | bigint;
};
export type ValueText = {
    tag: 'text';
    val: string;
};
export type ValueBlob = {
    tag: 'blob';
    val: Uint8Array;
};
export type ValueNull = {
    tag: 'null';
};
export interface SqliteResult {
    columns: string[];
    rows: {
        [key: string]: number | bigint | null | string | Uint8Array;
    }[];
}
export interface SqliteConnection {
    execute: (statement: string, parameters: ParameterValue[]) => SqliteResult;
}
export declare function open(label: string): SqliteConnection;
export declare function openDefault(): SqliteConnection;
