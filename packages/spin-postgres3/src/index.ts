import * as spinPg from 'spin:postgres/postgres@3.0.0';

export type SpinPostgresV3ValueBoolean = { tag: 'boolean'; val: boolean };
export type SpinPostgresV3ValueInt8 = { tag: 'int8'; val: number };
export type SpinPostgresV3ValueInt16 = { tag: 'int16'; val: number };
export type SpinPostgresV3ValueInt32 = { tag: 'int32'; val: number };
export type SpinPostgresV3ValueInt64 = { tag: 'int64'; val: bigint };
export type SpinPostgresV3ValueFloating32 = { tag: 'floating32'; val: number };
export type SpinPostgresV3ValueFloating64 = { tag: 'floating64'; val: number };
export type SpinPostgresV3ValueStr = { tag: 'str'; val: string };
export type SpinPostgresV3ValueBinary = { tag: 'binary'; val: Uint8Array };
export type SpinPostgresV3ValueDate = {
  tag: 'date';
  val: [number, number, number];
};
export type SpinPostgresV3ValueTime = {
  tag: 'time';
  val: [number, number, number, number];
};
export type SpinPostgresV3ValueDateTime = {
  tag: 'datetime';
  val: [number, number, number, number, number, number, number];
};
export type SpinPostgresV3ValueTimeStamp = { tag: 'timestamp'; val: bigint };
export type SpinPostgresV3ValueDbNull = { tag: 'db-null' };

export type SpinPostgresV3ParameterValue =
  | SpinPostgresV3ValueBoolean
  | SpinPostgresV3ValueInt8
  | SpinPostgresV3ValueInt16
  | SpinPostgresV3ValueInt32
  | SpinPostgresV3ValueInt64
  | SpinPostgresV3ValueFloating32
  | SpinPostgresV3ValueFloating64
  | SpinPostgresV3ValueStr
  | SpinPostgresV3ValueBinary
  | SpinPostgresV3ValueDate
  | SpinPostgresV3ValueTime
  | SpinPostgresV3ValueDateTime
  | SpinPostgresV3ValueTimeStamp
  | SpinPostgresV3ValueDbNull;

export type PostgresV3ParameterValue =
  | SpinPostgresV3ParameterValue
  | number
  | bigint
  | boolean
  | null
  | Uint8Array
  | string;

export enum PostgresV3DataType {
  PostgresV3Boolean = 'boolean',
  PostgresV3Int8 = 'int8',
  PostgresV3Int16 = 'int16',
  PostgresV3Int32 = 'int32',
  PostgresV3Int64 = 'int64',
  PostgresV3Floating32 = 'floating32',
  PostgresV3Floating64 = 'floating64',
  PostgresV3Str = 'str',
  PostgresV3Binary = 'binary',
  PostgresV3Date = 'date',
  PostgresV3Time = 'time',
  PostgresV3DateTime = 'datetime',
  PostgresV3TimeStamp = 'timestamp',
  PostgresV3Other = 'other',
}

export interface PostgresV3Column {
  name: string;
  dataType: PostgresV3DataType;
}

export interface PostgresV3RowSet {
  columns: PostgresV3Column[];
  rows: {
    [key: string]:
      | number
      | boolean
      | bigint
      | null
      | string
      | Uint8Array
      | Date;
  }[];
}

export type PostgresV3DbBoolean = { tag: 'boolean'; val: boolean };
export type PostgresV3DbInt8 = { tag: 'int8'; val: number };
export type PostgresV3DbInt16 = { tag: 'int16'; val: number };
export type PostgresV3DbInt32 = { tag: 'int32'; val: number };
export type PostgresV3DbInt64 = { tag: 'int64'; val: number };
export type PostgresV3DbFloating32 = { tag: 'floating32'; val: number };
export type PostgresV3DbFloating64 = { tag: 'floating64'; val: number };
export type PostgresV3DbStr = { tag: 'str'; val: string };
export type PostgresV3DbBinary = { tag: 'binary'; val: Uint8Array };
export type PostgresV3DbDate = { tag: 'date'; val: [number, number, number] };
export type PostgresV3DbTime = {
  tag: 'time';
  val: [number, number, number, number];
};
export type PostgresV3DbDateTime = {
  tag: 'datetime';
  val: [number, number, number, number, number, number, number];
};
export type PostgresV3DbTimeastamp = { tag: 'timestamp'; val: bigint };
export type PostgresV3DbNull = { tag: 'db-null' };
export type PostgresV3DbUnsupported = { tag: 'unsupported' };

export type RdbmsDbValue =
  | PostgresV3DbBoolean
  | PostgresV3DbInt8
  | PostgresV3DbInt16
  | PostgresV3DbInt32
  | PostgresV3DbInt64
  | PostgresV3DbFloating32
  | PostgresV3DbFloating64
  | PostgresV3DbStr
  | PostgresV3DbBinary
  | PostgresV3DbDate
  | PostgresV3DbTime
  | PostgresV3DbDateTime
  | PostgresV3DbTimeastamp
  | PostgresV3DbNull
  | PostgresV3DbUnsupported;

export type RdbmsRow = RdbmsDbValue[];

export interface SpinRdbmsRowSet {
  columns: PostgresV3Column[];
  rows: RdbmsRow[];
}

/**
 * Interface representing a PostgreSQL connection with methods for querying and executing statements.
 * @interface PostgresConnection
 */
export interface PostgresConnection {
  /**
   * Queries the database with the specified statement and parameters.
   * @param {string} statement - The SQL statement to execute.
   * @param {PostgresV3Value[]} params - The parameters for the SQL statement.
   * @returns {RdbmsRowSet} The result set of the query.
   */
  query: (
    statement: string,
    params: PostgresV3ParameterValue[],
  ) => PostgresV3RowSet;
  /**
   * Executes a statement on the database with the specified parameters.
   * @param {string} statement - The SQL statement to execute.
   * @param {PostgresV3Value[]} params - The parameters for the SQL statement.
   * @returns {number} The number of rows affected by the execution.
   */
  execute: (statement: string, params: PostgresV3ParameterValue[]) => bigint;
}

function createPostgresConnection(
  connection: spinPg.Connection,
): PostgresConnection {
  return {
    query: (statement: string, params: PostgresV3ParameterValue[]) => {
      let santizedParams = convertRdbmsToWitTypes(params);
      let ret = connection.query(statement, santizedParams) as SpinRdbmsRowSet;
      let results: PostgresV3RowSet = {
        columns: ret.columns,
        rows: [],
      };
      ret.rows.map((k: RdbmsRow, rowIndex: number) => {
        results.rows.push({});
        k.map((val, valIndex: number) => {
          switch (val.tag) {
            case 'date': {
              // Date (year, month, day)
              const [year, month, day] = val.val;
              results.rows[rowIndex][results.columns[valIndex].name] = new Date(
                Date.UTC(year, month - 1, day),
              ); // UTC Date object
              break;
            }

            case 'time': {
              // Time (hour, minute, second, nanosecond)
              const [hour, minute, second, nanosecond] = val.val;
              const date = new Date(Date.UTC(1970, 0, 1, hour, minute, second)); // Using an arbitrary date
              date.setMilliseconds(nanosecond / 1_000_000); // Convert nanoseconds to milliseconds
              results.rows[rowIndex][results.columns[valIndex].name] = date; // UTC Date object with only time set
              break;
            }

            case 'datetime': {
              // DateTime (year, month, day, hour, minute, second, nanosecond)
              const [year, month, day, hour, minute, second, nanosecond] =
                val.val;
              const date = new Date(
                Date.UTC(year, month - 1, day, hour, minute, second),
              );
              date.setMilliseconds(nanosecond / 1_000_000); // Convert nanoseconds to milliseconds
              results.rows[rowIndex][results.columns[valIndex].name] = date; // Complete UTC Date object
              break;
            }

            case 'timestamp': {
              // Timestamp (seconds since epoch)
              const seconds = val.val as unknown as number;
              results.rows[rowIndex][results.columns[valIndex].name] = new Date(
                seconds * 1000,
              ); // Convert seconds to milliseconds
              break;
            }

            default: {
              results.rows[rowIndex][results.columns[valIndex].name] =
                val.tag == 'db-null' || val.tag == 'unsupported'
                  ? null
                  : val.val;
              break;
            }
          }
        });
      });
      return results;
    },
    execute: (statement: string, params: PostgresV3ParameterValue[]) => {
      let santizedParams = convertRdbmsToWitTypes(params);
      let ret = connection.execute(statement, santizedParams) as bigint;
      return ret;
    },
  };
}

/**
 * Opens a PostgreSQL connection to the specified address.
 * @param {string} address - The address of the PostgreSQL server.
 * @returns {PostgresConnection} The PostgreSQL connection object.
 */
export function open(address: string): PostgresConnection {
  return createPostgresConnection(spinPg.Connection.open(address));
}

function convertRdbmsToWitTypes(
  parameters: PostgresV3ParameterValue[],
): SpinPostgresV3ParameterValue[] {
  let sanitized: SpinPostgresV3ParameterValue[] = [];
  for (let k of parameters) {
    if (typeof k === 'object') {
      sanitized.push(k as SpinPostgresV3ParameterValue);
      continue;
    }
    if (typeof k === 'string') {
      sanitized.push({ tag: 'str', val: k });
      continue;
    }
    if (typeof k === null) {
      sanitized.push({ tag: 'db-null' });
      continue;
    }
    if (typeof k === 'boolean') {
      sanitized.push({ tag: 'boolean', val: k });
      continue;
    }
    if (typeof k === 'bigint') {
      sanitized.push({ tag: 'int64', val: k });
      continue;
    }
    if (typeof k === 'number') {
      isFloat(k)
        ? sanitized.push({ tag: 'floating64', val: k })
        : sanitized.push({ tag: 'int32', val: k });
      continue;
    }
    if ((k as any) instanceof Uint8Array) {
      sanitized.push({ tag: 'binary', val: k });
      continue;
    }
  }
  return sanitized;
}

function isFloat(number: number) {
  return number % 1 !== 0;
}
