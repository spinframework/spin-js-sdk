//@ts-ignore
import * as spinPg from 'fermyon:spin/postgres@2.0.0';
import {
  RdbmsParameterValue,
  RdbmsRow,
  RdbmsRowSet,
  SpinRdbmsParameterValue,
  SpinRdbmsRowSet,
} from './types/rdbms';
export {
  ErrorConnectionFailed,
  ErrorBadParameter,
  ErrorQueryFailed,
  ErrorValueConversionFailed,
  ErrorOther,
} from './types/rdbms';
import { convertRdbmsToWitTypes } from './rdbmsHelper';

/**
 * Interface representing a PostgreSQL connection with methods for querying and executing statements.
 * @interface PostgresConnection
 */
export interface PostgresConnection {
  /**
   * Executes a statement on the database with the specified parameters.
   * @param {string} statement - The SQL statement to execute.
   * @param {RdbmsParameterValue[]} params - The parameters for the SQL statement.
   * @throws {@link ErrorBadParameter} A bad parameter was provided.
   * @throws {@link ErrorQueryFailed} The query execution failed.
   * @throws {@link ErrorValueConversionFailed} Value conversion failed.
   * @throws {@link ErrorOther} Some other error occurred.
   * @returns {number} The number of rows affected by the execution.
   */
  query: (statement: string, params: RdbmsParameterValue[]) => RdbmsRowSet;
  /**
   * Executes a statement on the database with the specified parameters.
   * @param {string} statement - The SQL statement to execute.
   * @param {RdbmsParameterValue[]} params - The parameters for the SQL statement.
   * @throws {@link ErrorBadParameter} A bad parameter was provided.
   * @throws {@link ErrorQueryFailed} The query execution failed.
   * @throws {@link ErrorValueConversionFailed} Value conversion failed.
   * @throws {@link ErrorOther} Some other error occurred.
   * @returns {number} The number of rows affected by the execution.
   */
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

/**
 * Opens a PostgreSQL connection to the specified address.
 * @param {string} address - The address of the PostgreSQL server.
 * @throws {@link ErrorConnectionFailed} Connection failure, e.g., address not allowed.
 * @throws {@link ErrorBadParameter} A bad parameter was provided.
 * @throws {@link ErrorQueryFailed} The query execution failed.
 * @throws {@link ErrorValueConversionFailed} Value conversion failed.
 * @throws {@link ErrorOther} Some other error occurred.
 * @returns {PostgresConnection} The PostgreSQL connection object.
 */
export function open(address: string): PostgresConnection {
  return createPostgresConnection(spinPg.Connection.open(address));
}
