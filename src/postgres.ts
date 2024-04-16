//@ts-ignore
import * as spinPg from "fermyon:spin/postgres@2.0.0"
import { RdbmsParameterValue, RdbmsRowSet } from "./types/rdbms"

export interface SpinPostgresConnection {
    query: (statement: string, params: RdbmsParameterValue[]) => RdbmsRowSet[]
    execute: (statement: string, params: RdbmsParameterValue[]) => number
}

export const Postgres = {
    open: (address: string): SpinPostgresConnection => {
        return spinPg.Connection.open(address)
    }
}