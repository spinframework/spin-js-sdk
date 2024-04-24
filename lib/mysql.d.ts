import { RdbmsParameterValue, RdbmsRowSet } from "./types/rdbms";
export interface MysqlConnection {
    query: (statement: string, params: RdbmsParameterValue[]) => RdbmsRowSet;
    execute: (statement: string, params: RdbmsParameterValue[]) => number;
}
export declare function open(address: string): MysqlConnection;
