declare module 'fermyon:spin/mysql@2.0.0' {
  export type Error = ErrorConnectionFailed | ErrorBadParameter | ErrorQueryFailed | ErrorValueConversionFailed | ErrorOther;
  export interface ErrorConnectionFailed {
    tag: 'connection-failed',
    val: string,
  }
  export interface ErrorBadParameter {
    tag: 'bad-parameter',
    val: string,
  }
  export interface ErrorQueryFailed {
    tag: 'query-failed',
    val: string,
  }
  export interface ErrorValueConversionFailed {
    tag: 'value-conversion-failed',
    val: string,
  }
  export interface ErrorOther {
    tag: 'other',
    val: string,
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
   * ## `"uint8"`
   * 
   * ## `"uint16"`
   * 
   * ## `"uint32"`
   * 
   * ## `"uint64"`
   * 
   * ## `"floating32"`
   * 
   * ## `"floating64"`
   * 
   * ## `"str"`
   * 
   * ## `"binary"`
   * 
   * ## `"other"`
   */
  export type DbDataType = 'boolean' | 'int8' | 'int16' | 'int32' | 'int64' | 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'floating32' | 'floating64' | 'str' | 'binary' | 'other';
  /**
   * Database values
   */
  export type DbValue = DbValueBoolean | DbValueInt8 | DbValueInt16 | DbValueInt32 | DbValueInt64 | DbValueUint8 | DbValueUint16 | DbValueUint32 | DbValueUint64 | DbValueFloating32 | DbValueFloating64 | DbValueStr | DbValueBinary | DbValueDbNull | DbValueUnsupported;
  export interface DbValueBoolean {
    tag: 'boolean',
    val: boolean,
  }
  export interface DbValueInt8 {
    tag: 'int8',
    val: number,
  }
  export interface DbValueInt16 {
    tag: 'int16',
    val: number,
  }
  export interface DbValueInt32 {
    tag: 'int32',
    val: number,
  }
  export interface DbValueInt64 {
    tag: 'int64',
    val: bigint,
  }
  export interface DbValueUint8 {
    tag: 'uint8',
    val: number,
  }
  export interface DbValueUint16 {
    tag: 'uint16',
    val: number,
  }
  export interface DbValueUint32 {
    tag: 'uint32',
    val: number,
  }
  export interface DbValueUint64 {
    tag: 'uint64',
    val: bigint,
  }
  export interface DbValueFloating32 {
    tag: 'floating32',
    val: number,
  }
  export interface DbValueFloating64 {
    tag: 'floating64',
    val: number,
  }
  export interface DbValueStr {
    tag: 'str',
    val: string,
  }
  export interface DbValueBinary {
    tag: 'binary',
    val: Uint8Array,
  }
  export interface DbValueDbNull {
    tag: 'db-null',
  }
  export interface DbValueUnsupported {
    tag: 'unsupported',
  }
  /**
   * Values used in parameterized queries
   */
  export type ParameterValue = ParameterValueBoolean | ParameterValueInt8 | ParameterValueInt16 | ParameterValueInt32 | ParameterValueInt64 | ParameterValueUint8 | ParameterValueUint16 | ParameterValueUint32 | ParameterValueUint64 | ParameterValueFloating32 | ParameterValueFloating64 | ParameterValueStr | ParameterValueBinary | ParameterValueDbNull;
  export interface ParameterValueBoolean {
    tag: 'boolean',
    val: boolean,
  }
  export interface ParameterValueInt8 {
    tag: 'int8',
    val: number,
  }
  export interface ParameterValueInt16 {
    tag: 'int16',
    val: number,
  }
  export interface ParameterValueInt32 {
    tag: 'int32',
    val: number,
  }
  export interface ParameterValueInt64 {
    tag: 'int64',
    val: bigint,
  }
  export interface ParameterValueUint8 {
    tag: 'uint8',
    val: number,
  }
  export interface ParameterValueUint16 {
    tag: 'uint16',
    val: number,
  }
  export interface ParameterValueUint32 {
    tag: 'uint32',
    val: number,
  }
  export interface ParameterValueUint64 {
    tag: 'uint64',
    val: bigint,
  }
  export interface ParameterValueFloating32 {
    tag: 'floating32',
    val: number,
  }
  export interface ParameterValueFloating64 {
    tag: 'floating64',
    val: number,
  }
  export interface ParameterValueStr {
    tag: 'str',
    val: string,
  }
  export interface ParameterValueBinary {
    tag: 'binary',
    val: Uint8Array,
  }
  export interface ParameterValueDbNull {
    tag: 'db-null',
  }
  /**
   * A database column
   */
  export interface Column {
    name: string,
    dataType: DbDataType,
  }
  /**
   * A database row
   */
  export type Row = Array<DbValue>;
  /**
   * A set of database rows
   */
  export interface RowSet {
    columns: Array<Column>,
    rows: Array<Row>,
  }

  export class Connection {
    /**
    * Open a connection to the MySQL instance at `address`.
    */
    static open(address: string): Connection;
    /**
    * query the database: select
    */
    query(statement: string, params: Array<ParameterValue>): RowSet;
    /**
    * execute command to the database: insert, update, delete
    */
    execute(statement: string, params: Array<ParameterValue>): void;
  }

}