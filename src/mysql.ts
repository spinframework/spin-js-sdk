//@ts-ignore
import * as spinMysql from "fermyon:spin/mysql@2.0.0"
import { RdbmsParameterValue, RdbmsRowSet } from "./types/rdbms"

export interface SpinMysqlConnection {
    query: (statement: string, params: RdbmsParameterValue[]) => RdbmsRowSet[]
    execute: (statement: string, params: RdbmsParameterValue[]) => number
}

export const Mysql = {
    open: (address: string): SpinMysqlConnection => {
        return spinMysql.Connection.open(address)
    }
}