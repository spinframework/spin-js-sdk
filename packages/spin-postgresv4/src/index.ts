import * as spinPg from 'spin:postgres/postgres@4.0.0';

export type RangeBoundKind = 'inclusive' | 'exclusive';

export type SpinPostgresV4ValueBoolean = { tag: 'boolean'; val: boolean };
export type SpinPostgresV4ValueInt8 = { tag: 'int8'; val: number };
export type SpinPostgresV4ValueInt16 = { tag: 'int16'; val: number };
export type SpinPostgresV4ValueInt32 = { tag: 'int32'; val: number };
export type SpinPostgresV4ValueInt64 = { tag: 'int64'; val: bigint };
export type SpinPostgresV4ValueFloating32 = { tag: 'floating32'; val: number };
export type SpinPostgresV4ValueFloating64 = { tag: 'floating64'; val: number };
export type SpinPostgresV4ValueStr = { tag: 'str'; val: string };
export type SpinPostgresV4ValueBinary = { tag: 'binary'; val: Uint8Array };
export type SpinPostgresV4ValueDate = { tag: 'date'; val: [number, number, number]; };
export type SpinPostgresV4ValueTime = { tag: 'time'; val: [number, number, number, number]; };
export type SpinPostgresV4ValueDateTime = {
  tag: 'datetime';
  val: [number, number, number, number, number, number, number];
};
export type SpinPostgresV4ValueTimeStamp = { tag: 'timestamp'; val: bigint };
export interface SpinPostgresV4DbValueUuid {
  tag: 'uuid',
  val: string,
}
export interface SpinPostgresV4DbValueJsonb {
  tag: 'jsonb',
  val: Uint8Array,
}
export interface SpinPostgresV4DbValueDecimal {
  tag: 'decimal',
  val: string,
}
export interface SpinPostgresV4DbValueRangeInt32 {
  tag: 'range-int32',
  val: [[number, RangeBoundKind] | undefined, [number, RangeBoundKind] | undefined],
}
export interface SpinPostgresV4DbValueRangeInt64 {
  tag: 'range-int64',
  val: [[bigint, RangeBoundKind] | undefined, [bigint, RangeBoundKind] | undefined],
}
export interface SpinPostgresV4DbValueRangeDecimal {
  tag: 'range-decimal',
  val: [[string, RangeBoundKind] | undefined, [string, RangeBoundKind] | undefined],
}
export interface SpinPostgresV4DbValueArrayInt32 {
  tag: 'array-int32',
  val: Array<number | undefined>,
}
export interface SpinPostgresV4DbValueArrayInt64 {
  tag: 'array-int64',
  val: Array<bigint | undefined>,
}
export interface SpinPostgresV4DbValueArrayDecimal {
  tag: 'array-decimal',
  val: Array<string | undefined>,
}
export interface SpinPostgresV4DbValueArrayStr {
  tag: 'array-str',
  val: Array<string | undefined>,
}
export interface SpinPostgresV4DbValueInterval {
  tag: 'interval',
  val: spinPg.Interval,
}

export interface SpinPostgresV4Unsupported {
  tag: 'unsupported',
  val: Uint8Array,
}

export type SpinPostgresV4ValueDbNull = { tag: 'db-null' };


export type SpinPostgresV4ParameterValue =
  | SpinPostgresV4ValueBoolean
  | SpinPostgresV4ValueInt8
  | SpinPostgresV4ValueInt16
  | SpinPostgresV4ValueInt32
  | SpinPostgresV4ValueInt64
  | SpinPostgresV4ValueFloating32
  | SpinPostgresV4ValueFloating64
  | SpinPostgresV4ValueStr
  | SpinPostgresV4ValueBinary
  | SpinPostgresV4ValueDate
  | SpinPostgresV4ValueTime
  | SpinPostgresV4ValueDateTime
  | SpinPostgresV4ValueTimeStamp
  | SpinPostgresV4DbValueUuid
  | SpinPostgresV4DbValueJsonb
  | SpinPostgresV4DbValueDecimal
  | SpinPostgresV4DbValueRangeInt32
  | SpinPostgresV4DbValueRangeInt64
  | SpinPostgresV4DbValueRangeDecimal
  | SpinPostgresV4DbValueArrayInt32
  | SpinPostgresV4DbValueArrayInt64
  | SpinPostgresV4DbValueArrayDecimal
  | SpinPostgresV4DbValueArrayStr
  | SpinPostgresV4DbValueInterval
  | SpinPostgresV4ValueDbNull;

export type PostgresV4ParameterValue =
  | SpinPostgresV4ParameterValue
  | number
  | bigint
  | boolean
  | null
  | Uint8Array
  | string;

export enum PostgresV4DataType {
  PostgresV4Boolean = 'boolean',
  PostgresV4Int8 = 'int8',
  PostgresV4Int16 = 'int16',
  PostgresV4Int32 = 'int32',
  PostgresV4Int64 = 'int64',
  PostgresV4Floating32 = 'floating32',
  PostgresV4Floating64 = 'floating64',
  PostgresV4Str = 'str',
  PostgresV4Binary = 'binary',
  PostgresV4Date = 'date',
  PostgresV4Time = 'time',
  PostgresV4DateTime = 'datetime',
  PostgresV4TimeStamp = 'timestamp',
  PostgresV4Uuid = 'uuid',
  PostgresV4Jsonb = 'jsonb',
  PostgresV4Decimal = 'decimal',
  PostgresV4RangeInt32 = 'range-int32',
  PostgresV4RangeInt64 = 'range-int64',
  PostgresV4RangeDecimal = 'range-decimal',
  PostgresV4ArrayInt32 = 'array-int32',
  PostgresV4ArrayInt64 = 'array-int64',
  PostgresV4ArrayDecimal = 'array-decimal',
  PostgresV4ArrayStr = 'array-str',
  PostgresV4Interval = 'interval',
  PostgresV4Other = 'other',
}

export interface PostgresV4Column {
  name: string;
  dataType: PostgresV4DataType;
}

export interface PostgresV4RowSet {
  columns: PostgresV4Column[];
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

export type PostgresV4DbBoolean = { tag: 'boolean'; val: boolean };
export type PostgresV4DbInt8 = { tag: 'int8'; val: number };
export type PostgresV4DbInt16 = { tag: 'int16'; val: number };
export type PostgresV4DbInt32 = { tag: 'int32'; val: number };
export type PostgresV4DbInt64 = { tag: 'int64'; val: number };
export type PostgresV4DbFloating32 = { tag: 'floating32'; val: number };
export type PostgresV4DbFloating64 = { tag: 'floating64'; val: number };
export type PostgresV4DbStr = { tag: 'str'; val: string };
export type PostgresV4DbBinary = { tag: 'binary'; val: Uint8Array };
export type PostgresV4DbDate = { tag: 'date'; val: [number, number, number] };
export type PostgresV4DbTime = {
  tag: 'time';
  val: [number, number, number, number];
};
export type PostgresV4DbDateTime = {
  tag: 'datetime';
  val: [number, number, number, number, number, number, number];
};
export type PostgresV4DbTimeastamp = { tag: 'timestamp'; val: bigint };
export type PostgresV4DbNull = { tag: 'db-null' };
export type PostgresV4DbUnsupported = { tag: 'unsupported' };

export type RdbmsDbValue =
  | PostgresV4DbBoolean
  | PostgresV4DbInt8
  | PostgresV4DbInt16
  | PostgresV4DbInt32
  | PostgresV4DbInt64
  | PostgresV4DbFloating32
  | PostgresV4DbFloating64
  | PostgresV4DbStr
  | PostgresV4DbBinary
  | PostgresV4DbDate
  | PostgresV4DbTime
  | PostgresV4DbDateTime
  | PostgresV4DbTimeastamp
  | PostgresV4DbNull
  | PostgresV4DbUnsupported;

export type RdbmsRow = RdbmsDbValue[];

export interface SpinRdbmsRowSet {
  columns: PostgresV4Column[];
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
   * @param {PostgresV4Value[]} params - The parameters for the SQL statement.
   * @returns {RdbmsRowSet} The result set of the query.
   */
  query: (
    statement: string,
    params: PostgresV4ParameterValue[],
  ) => PostgresV4RowSet;
  /**
   * Executes a statement on the database with the specified parameters.
   * @param {string} statement - The SQL statement to execute.
   * @param {PostgresV4Value[]} params - The parameters for the SQL statement.
   * @returns {number} The number of rows affected by the execution.
   */
  execute: (statement: string, params: PostgresV4ParameterValue[]) => bigint;
}

function createPostgresConnection(
  connection: spinPg.Connection,
): PostgresConnection {
  return {
    query: (statement: string, params: PostgresV4ParameterValue[]) => {
      let santizedParams = convertRdbmsToWitTypes(params);
      let ret = mapRowSet(connection.query(statement, santizedParams)) as SpinRdbmsRowSet;
      let results: PostgresV4RowSet = {
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
    execute: (statement: string, params: PostgresV4ParameterValue[]) => {
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
  parameters: PostgresV4ParameterValue[],
): SpinPostgresV4ParameterValue[] {
  let sanitized: SpinPostgresV4ParameterValue[] = [];
  for (let k of parameters) {
    if (typeof k === 'object') {
      sanitized.push(k as SpinPostgresV4ParameterValue);
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

function mapDbDataType(dbType: spinPg.DbDataType): PostgresV4DataType {
  switch (dbType.tag) {
    case 'boolean': return PostgresV4DataType.PostgresV4Boolean;
    case 'int8': return PostgresV4DataType.PostgresV4Int8;
    case 'int16': return PostgresV4DataType.PostgresV4Int16;
    case 'int32': return PostgresV4DataType.PostgresV4Int32;
    case 'int64': return PostgresV4DataType.PostgresV4Int64;
    case 'floating32': return PostgresV4DataType.PostgresV4Floating32;
    case 'floating64': return PostgresV4DataType.PostgresV4Floating64;
    case 'str': return PostgresV4DataType.PostgresV4Str;
    case 'binary': return PostgresV4DataType.PostgresV4Binary;
    case 'date': return PostgresV4DataType.PostgresV4Date;
    case 'time': return PostgresV4DataType.PostgresV4Time;
    case 'datetime': return PostgresV4DataType.PostgresV4DateTime;
    case 'timestamp': return PostgresV4DataType.PostgresV4TimeStamp;
    case 'uuid': return PostgresV4DataType.PostgresV4Uuid;
    case 'jsonb': return PostgresV4DataType.PostgresV4Jsonb;
    case 'decimal': return PostgresV4DataType.PostgresV4Decimal;
    case 'range-int32': return PostgresV4DataType.PostgresV4RangeInt32;
    case 'range-int64': return PostgresV4DataType.PostgresV4RangeInt64;
    case 'range-decimal': return PostgresV4DataType.PostgresV4RangeDecimal;
    case 'array-int32': return PostgresV4DataType.PostgresV4ArrayInt32;
    case 'array-int64': return PostgresV4DataType.PostgresV4ArrayInt64;
    case 'array-decimal': return PostgresV4DataType.PostgresV4ArrayDecimal;
    case 'array-str': return PostgresV4DataType.PostgresV4ArrayStr;
    case 'interval': return PostgresV4DataType.PostgresV4Interval;
    case 'other': return PostgresV4DataType.PostgresV4Other;
  }
}

function mapRowSet(rowSet: spinPg.RowSet): SpinRdbmsRowSet {
  return {
    columns: rowSet.columns.map(c => ({
      name: c.name,
      dataType: mapDbDataType(c.dataType),
    })),
    rows: rowSet.rows as RdbmsRow[], // still compatible
  };
}