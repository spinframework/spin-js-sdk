import { RdbmsParameterValue, RdbmsRowSet } from "./types/rdbms";
export interface SpinMysqlConnection {
    query: (statement: string, params: RdbmsParameterValue[]) => RdbmsRowSet;
    execute: (statement: string, params: RdbmsParameterValue[]) => number;
}
export declare const Mysql: {
    open: (address: string) => SpinMysqlConnection;
};
