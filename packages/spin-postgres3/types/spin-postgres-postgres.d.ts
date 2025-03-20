declare module 'spin:postgres/postgres@3.0.0' {
  /**
   * Errors related to interacting with a database.
   */
  export type Error =
    | ErrorConnectionFailed
    | ErrorBadParameter
    | ErrorQueryFailed
    | ErrorValueConversionFailed
    | ErrorOther;
  export interface ErrorConnectionFailed {
    tag: 'connection-failed';
    val: string;
  }
  export interface ErrorBadParameter {
    tag: 'bad-parameter';
    val: string;
  }
  export interface ErrorQueryFailed {
    tag: 'query-failed';
    val: string;
  }
  export interface ErrorValueConversionFailed {
    tag: 'value-conversion-failed';
    val: string;
  }
  export interface ErrorOther {
    tag: 'other';
    val: string;
  }
  /**
   * Data types for a database column
   * # Variants
   *
   * ## `"boolean"`
   *
   * ## `"int8"`
   *
   * ## `"int16"`
   *
   * ## `"int32"`
   *
   * ## `"int64"`
   *
   * ## `"floating32"`
   *
   * ## `"floating64"`
   *
   * ## `"str"`
   *
   * ## `"binary"`
   *
   * ## `"date"`
   *
   * ## `"time"`
   *
   * ## `"datetime"`
   *
   * ## `"timestamp"`
   *
   * ## `"other"`
   */
  export type DbDataType =
    | 'boolean'
    | 'int8'
    | 'int16'
    | 'int32'
    | 'int64'
    | 'floating32'
    | 'floating64'
    | 'str'
    | 'binary'
    | 'date'
    | 'time'
    | 'datetime'
    | 'timestamp'
    | 'other';
  /**
   * Database values
   */
  export type DbValue =
    | DbValueBoolean
    | DbValueInt8
    | DbValueInt16
    | DbValueInt32
    | DbValueInt64
    | DbValueFloating32
    | DbValueFloating64
    | DbValueStr
    | DbValueBinary
    | DbValueDate
    | DbValueTime
    | DbValueDatetime
    | DbValueTimestamp
    | DbValueDbNull
    | DbValueUnsupported;
  export interface DbValueBoolean {
    tag: 'boolean';
    val: boolean;
  }
  export interface DbValueInt8 {
    tag: 'int8';
    val: number;
  }
  export interface DbValueInt16 {
    tag: 'int16';
    val: number;
  }
  export interface DbValueInt32 {
    tag: 'int32';
    val: number;
  }
  export interface DbValueInt64 {
    tag: 'int64';
    val: bigint;
  }
  export interface DbValueFloating32 {
    tag: 'floating32';
    val: number;
  }
  export interface DbValueFloating64 {
    tag: 'floating64';
    val: number;
  }
  export interface DbValueStr {
    tag: 'str';
    val: string;
  }
  export interface DbValueBinary {
    tag: 'binary';
    val: Uint8Array;
  }
  export interface DbValueDate {
    tag: 'date';
    val: [number, number, number];
  }
  /**
   * (year, month, day)
   */
  export interface DbValueTime {
    tag: 'time';
    val: [number, number, number, number];
  }
  /**
   * (hour, minute, second, nanosecond)
   * Date-time types are always treated as UTC (without timezone info).
   * The instant is represented as a (year, month, day, hour, minute, second, nanosecond) tuple.
   */
  export interface DbValueDatetime {
    tag: 'datetime';
    val: [number, number, number, number, number, number, number];
  }
  /**
   * Unix timestamp (seconds since epoch)
   */
  export interface DbValueTimestamp {
    tag: 'timestamp';
    val: bigint;
  }
  export interface DbValueDbNull {
    tag: 'db-null';
  }
  export interface DbValueUnsupported {
    tag: 'unsupported';
  }
  /**
   * Values used in parameterized queries
   */
  export type ParameterValue =
    | ParameterValueBoolean
    | ParameterValueInt8
    | ParameterValueInt16
    | ParameterValueInt32
    | ParameterValueInt64
    | ParameterValueFloating32
    | ParameterValueFloating64
    | ParameterValueStr
    | ParameterValueBinary
    | ParameterValueDate
    | ParameterValueTime
    | ParameterValueDatetime
    | ParameterValueTimestamp
    | ParameterValueDbNull;
  export interface ParameterValueBoolean {
    tag: 'boolean';
    val: boolean;
  }
  export interface ParameterValueInt8 {
    tag: 'int8';
    val: number;
  }
  export interface ParameterValueInt16 {
    tag: 'int16';
    val: number;
  }
  export interface ParameterValueInt32 {
    tag: 'int32';
    val: number;
  }
  export interface ParameterValueInt64 {
    tag: 'int64';
    val: bigint;
  }
  export interface ParameterValueFloating32 {
    tag: 'floating32';
    val: number;
  }
  export interface ParameterValueFloating64 {
    tag: 'floating64';
    val: number;
  }
  export interface ParameterValueStr {
    tag: 'str';
    val: string;
  }
  export interface ParameterValueBinary {
    tag: 'binary';
    val: Uint8Array;
  }
  export interface ParameterValueDate {
    tag: 'date';
    val: [number, number, number];
  }
  /**
   * (year, month, day)
   */
  export interface ParameterValueTime {
    tag: 'time';
    val: [number, number, number, number];
  }
  /**
   * (hour, minute, second, nanosecond)
   * Date-time types are always treated as UTC (without timezone info).
   * The instant is represented as a (year, month, day, hour, minute, second, nanosecond) tuple.
   */
  export interface ParameterValueDatetime {
    tag: 'datetime';
    val: [number, number, number, number, number, number, number];
  }
  /**
   * Unix timestamp (seconds since epoch)
   */
  export interface ParameterValueTimestamp {
    tag: 'timestamp';
    val: bigint;
  }
  export interface ParameterValueDbNull {
    tag: 'db-null';
  }
  /**
   * A database column
   */
  export interface Column {
    name: string;
    dataType: DbDataType;
  }
  /**
   * A database row
   */
  export type Row = Array<DbValue>;
  /**
   * A set of database rows
   */
  export interface RowSet {
    columns: Array<Column>;
    rows: Array<Row>;
  }

  export class Connection {
    /**
     * Open a connection to the Postgres instance at `address`.
     */
    static open(address: string): Connection;
    /**
     * Query the database.
     */
    query(statement: string, params: Array<ParameterValue>): RowSet;
    /**
     * Execute command to the database.
     */
    execute(statement: string, params: Array<ParameterValue>): bigint;
  }
}
