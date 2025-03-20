import * as spinSqlite from 'fermyon:spin/sqlite@2.0.0';

export type sqliteValues =
  | ValueInteger
  | ValueReal
  | ValueText
  | ValueBlob
  | ValueNull;
export type ParameterValue =
  | sqliteValues
  | number
  | bigint
  | null
  | string
  | Uint8Array;
type SqliteRowResultItem = {
  tag: string;
  val: number | bigint | string | Uint8Array | null;
};
type SqliteRowResult = { values: SqliteRowResultItem[] };
export type ValueInteger = { tag: 'integer'; val: bigint };
export type ValueReal = { tag: 'real'; val: number };
export type ValueText = { tag: 'text'; val: string };
export type ValueBlob = { tag: 'blob'; val: Uint8Array };
export type ValueNull = { tag: 'null' };

/**
 * Interface representing the result of an SQLite query.
 * @interface SpinSqliteResult
 * @property {string[]} columns - The column names in the result.
 * @property {SqliteRowResult[]} rows - The rows of results.
 */
interface SpinSqliteResult {
  columns: string[];
  rows: SqliteRowResult[];
}

/**
 * Interface representing the formatted result of an SQLite query.
 * @interface SqliteResult
 * @property {string[]} columns - The column names in the result.
 * @property {Object<string, number | bigint | null | string | Uint8Array>[]} rows - The rows of results.
 */
export interface SqliteResult {
  columns: string[];
  rows: { [key: string]: number | bigint | null | string | Uint8Array }[];
}

/**
 * Interface representing a connection to an SQLite database with a method for executing queries.
 * @interface SqliteConnection
 */
export interface SqliteConnection {
  /**
   * Executes an SQLite statement with given parameters and returns the result.
   * @param {string} statement - The SQL statement to execute.
   * @param {ParameterValue[]} parameters - The parameters for the SQL statement.
   * @returns {SqliteResult}
   */
  execute: (statement: string, parameters: ParameterValue[]) => SqliteResult;
}

function createSqliteConnection(
  connection: spinSqlite.Connection,
): SqliteConnection {
  return {
    execute: (
      statement: string,
      parameters: ParameterValue[],
    ): SqliteResult => {
      let santizedParams = convertToWitTypes(parameters);
      let ret = connection.execute(
        statement,
        santizedParams,
      ) as SpinSqliteResult;
      let results: SqliteResult = {
        columns: ret.columns,
        rows: [],
      };
      ret.rows.map((k: SqliteRowResult, rowIndex: number) => {
        results.rows.push({});
        k.values.map((val, valIndex: number) => {
          results.rows[rowIndex][results.columns[valIndex]] = val.val;
        });
      });
      return results;
    },
  };
}

/**
 * Opens a connection to the SQLite database with the specified label.
 * @param {string} label - The label of the database to connect to.
 * @returns {SqliteConnection} The SQLite connection object.
 */
export function open(label: string): SqliteConnection {
  return createSqliteConnection(spinSqlite.Connection.open(label));
}

/**
 * Opens a connection to the default SQLite database.
 * @returns {SqliteConnection} The SQLite connection object.
 */
export function openDefault(): SqliteConnection {
  return createSqliteConnection(spinSqlite.Connection.open('default'));
}

const valueInteger = (value: bigint): ValueInteger => {
  return { tag: 'integer', val: value };
};

const valueReal = (value: number): ValueReal => {
  return { tag: 'real', val: value };
};

const valueText = (value: string): ValueText => {
  return { tag: 'text', val: value };
};

const valueBlob = (value: Uint8Array): ValueBlob => {
  return { tag: 'blob', val: value };
};

const valueNull = (): ValueNull => {
  return { tag: 'null' };
};

function convertToWitTypes(parameters: ParameterValue[]): sqliteValues[] {
  let sanitized: sqliteValues[] = [];
  for (let k of parameters) {
    if (typeof k === 'object') {
      sanitized.push(k as sqliteValues);
      continue;
    }
    if (typeof k === 'number') {
      isFloat(k)
        ? sanitized.push(valueReal(k))
        : sanitized.push(valueInteger(BigInt(k)));
      continue;
    }
    if (typeof k === 'bigint') {
      sanitized.push(valueInteger(k));
      continue;
    }
    if (typeof k === 'string') {
      sanitized.push(valueText(k));
      continue;
    }
    if (k === null) {
      sanitized.push(valueNull());
      continue;
    }
    if ((k as any) instanceof Uint8Array) {
      sanitized.push(valueBlob(k));
      continue;
    }
  }
  return sanitized;
}

function isFloat(number: number) {
  return number % 1 !== 0;
}
