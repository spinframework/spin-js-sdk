import { RdbmsParameterValue, RdbmsRowSet } from "./types/rdbms";
export interface SpinPostgresConnection {
    query: (statement: string, params: RdbmsParameterValue[]) => RdbmsRowSet;
    execute: (statement: string, params: RdbmsParameterValue[]) => number;
}
export declare const Postgres: {
    open: (address: string) => SpinPostgresConnection;
};
