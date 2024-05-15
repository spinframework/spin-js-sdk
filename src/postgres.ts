//@ts-ignore
import * as spinPg from 'fermyon:spin/postgres@2.0.0';
import {
  RdbmsParameterValue,
  RdbmsRow,
  RdbmsRowSet,
  SpinRdbmsParameterValue,
  SpinRdbmsRowSet,
} from './types/rdbms';
import { convertRdbmsToWitTypes } from './rdbmsHelper';

export interface PostgresConnection {
  query: (statement: string, params: RdbmsParameterValue[]) => RdbmsRowSet;
  execute: (statement: string, params: RdbmsParameterValue[]) => number;
}

function createPostgresConnection(
  connection: spinPg.Connection,
): PostgresConnection {
  return {
    query: (statement: string, params: RdbmsParameterValue[]) => {
      let santizedParams = convertRdbmsToWitTypes(params);
      let ret = connection.query(statement, santizedParams) as SpinRdbmsRowSet;
      let results: RdbmsRowSet = {
        columns: ret.columns,
        rows: [],
      };
      ret.rows.map((k: RdbmsRow, rowIndex: number) => {
        results.rows.push({});
        k.map((val, valIndex: number) => {
          results.rows[rowIndex][results.columns[valIndex].name] =
            val.tag == 'db-null' || val.tag == 'unsupported' ? null : val.val;
        });
      });
      return results;
    },
    execute: (statement: string, params: RdbmsParameterValue[]) => {
      let santizedParams = convertRdbmsToWitTypes(params);
      let ret = connection.execute(statement, santizedParams) as number;
      return ret;
    },
  };
}

export function open(address: string): PostgresConnection {
  return createPostgresConnection(spinPg.Connection.open(address));
}
