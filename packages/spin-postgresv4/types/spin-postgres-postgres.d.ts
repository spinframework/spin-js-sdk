declare module 'spin:postgres/postgres@4.0.0' {
  export interface DbError {
    /**
     * Stringised version of the error. This is primarily to facilitate migration of older code.
     */
    asText: string,
    severity: string,
    code: string,
    message: string,
    detail?: string,
    /**
     * Any error information provided by Postgres and not captured above.
     */
    extras: Array<[string, string]>,
  }
  export type QueryError = QueryErrorText | QueryErrorDbError;
  /**
   * An error occurred but we do not have structured info for it
   */
  export interface QueryErrorText {
    tag: 'text',
    val: string,
  }
  /**
   * Postgres returned a structured database error
   */
  export interface QueryErrorDbError {
    tag: 'db-error',
    val: DbError,
  }
  /**
   * Errors related to interacting with a database.
   */
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
    val: QueryError,
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
   */
  export type DbDataType = DbDataTypeBoolean | DbDataTypeInt8 | DbDataTypeInt16 | DbDataTypeInt32 | DbDataTypeInt64 | DbDataTypeFloating32 | DbDataTypeFloating64 | DbDataTypeStr | DbDataTypeBinary | DbDataTypeDate | DbDataTypeTime | DbDataTypeDatetime | DbDataTypeTimestamp | DbDataTypeUuid | DbDataTypeJsonb | DbDataTypeDecimal | DbDataTypeRangeInt32 | DbDataTypeRangeInt64 | DbDataTypeRangeDecimal | DbDataTypeArrayInt32 | DbDataTypeArrayInt64 | DbDataTypeArrayDecimal | DbDataTypeArrayStr | DbDataTypeInterval | DbDataTypeOther;
  export interface DbDataTypeBoolean {
    tag: 'boolean',
  }
  export interface DbDataTypeInt8 {
    tag: 'int8',
  }
  export interface DbDataTypeInt16 {
    tag: 'int16',
  }
  export interface DbDataTypeInt32 {
    tag: 'int32',
  }
  export interface DbDataTypeInt64 {
    tag: 'int64',
  }
  export interface DbDataTypeFloating32 {
    tag: 'floating32',
  }
  export interface DbDataTypeFloating64 {
    tag: 'floating64',
  }
  export interface DbDataTypeStr {
    tag: 'str',
  }
  export interface DbDataTypeBinary {
    tag: 'binary',
  }
  export interface DbDataTypeDate {
    tag: 'date',
  }
  export interface DbDataTypeTime {
    tag: 'time',
  }
  export interface DbDataTypeDatetime {
    tag: 'datetime',
  }
  export interface DbDataTypeTimestamp {
    tag: 'timestamp',
  }
  export interface DbDataTypeUuid {
    tag: 'uuid',
  }
  export interface DbDataTypeJsonb {
    tag: 'jsonb',
  }
  export interface DbDataTypeDecimal {
    tag: 'decimal',
  }
  export interface DbDataTypeRangeInt32 {
    tag: 'range-int32',
  }
  export interface DbDataTypeRangeInt64 {
    tag: 'range-int64',
  }
  export interface DbDataTypeRangeDecimal {
    tag: 'range-decimal',
  }
  export interface DbDataTypeArrayInt32 {
    tag: 'array-int32',
  }
  export interface DbDataTypeArrayInt64 {
    tag: 'array-int64',
  }
  export interface DbDataTypeArrayDecimal {
    tag: 'array-decimal',
  }
  export interface DbDataTypeArrayStr {
    tag: 'array-str',
  }
  export interface DbDataTypeInterval {
    tag: 'interval',
  }
  export interface DbDataTypeOther {
    tag: 'other',
    val: string,
  }
  export interface Interval {
    micros: bigint,
    days: number,
    months: number,
  }
  /**
   * A database column
   */
  export interface Column {
    name: string,
    dataType: DbDataType,
  }
  /**
   * For range types, indicates if each bound is inclusive or exclusive
   * # Variants
   * 
   * ## `"inclusive"`
   * 
   * ## `"exclusive"`
   */
  export type RangeBoundKind = 'inclusive' | 'exclusive';
  /**
   * Database values
   */
  export type DbValue = DbValueBoolean | DbValueInt8 | DbValueInt16 | DbValueInt32 | DbValueInt64 | DbValueFloating32 | DbValueFloating64 | DbValueStr | DbValueBinary | DbValueDate | DbValueTime | DbValueDatetime | DbValueTimestamp | DbValueUuid | DbValueJsonb | DbValueDecimal | DbValueRangeInt32 | DbValueRangeInt64 | DbValueRangeDecimal | DbValueArrayInt32 | DbValueArrayInt64 | DbValueArrayDecimal | DbValueArrayStr | DbValueInterval | DbValueDbNull | DbValueUnsupported;
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
  export interface DbValueDate {
    tag: 'date',
    val: [number, number, number],
  }
  /**
   * (year, month, day)
   */
  export interface DbValueTime {
    tag: 'time',
    val: [number, number, number, number],
  }
  /**
   * (hour, minute, second, nanosecond)
   * Date-time types are always treated as UTC (without timezone info).
   * The instant is represented as a (year, month, day, hour, minute, second, nanosecond) tuple.
   */
  export interface DbValueDatetime {
    tag: 'datetime',
    val: [number, number, number, number, number, number, number],
  }
  /**
   * Unix timestamp (seconds since epoch)
   */
  export interface DbValueTimestamp {
    tag: 'timestamp',
    val: bigint,
  }
  export interface DbValueUuid {
    tag: 'uuid',
    val: string,
  }
  export interface DbValueJsonb {
    tag: 'jsonb',
    val: Uint8Array,
  }
  export interface DbValueDecimal {
    tag: 'decimal',
    val: string,
  }
  /**
   * I admit defeat. Base 10
   */
  export interface DbValueRangeInt32 {
    tag: 'range-int32',
    val: [[number, RangeBoundKind] | undefined, [number, RangeBoundKind] | undefined],
  }
  export interface DbValueRangeInt64 {
    tag: 'range-int64',
    val: [[bigint, RangeBoundKind] | undefined, [bigint, RangeBoundKind] | undefined],
  }
  export interface DbValueRangeDecimal {
    tag: 'range-decimal',
    val: [[string, RangeBoundKind] | undefined, [string, RangeBoundKind] | undefined],
  }
  export interface DbValueArrayInt32 {
    tag: 'array-int32',
    val: Array<number | undefined>,
  }
  export interface DbValueArrayInt64 {
    tag: 'array-int64',
    val: Array<bigint | undefined>,
  }
  export interface DbValueArrayDecimal {
    tag: 'array-decimal',
    val: Array<string | undefined>,
  }
  export interface DbValueArrayStr {
    tag: 'array-str',
    val: Array<string | undefined>,
  }
  export interface DbValueInterval {
    tag: 'interval',
    val: Interval,
  }
  export interface DbValueDbNull {
    tag: 'db-null',
  }
  export interface DbValueUnsupported {
    tag: 'unsupported',
    val: Uint8Array,
  }
  /**
   * Values used in parameterized queries
   */
  export type ParameterValue = ParameterValueBoolean | ParameterValueInt8 | ParameterValueInt16 | ParameterValueInt32 | ParameterValueInt64 | ParameterValueFloating32 | ParameterValueFloating64 | ParameterValueStr | ParameterValueBinary | ParameterValueDate | ParameterValueTime | ParameterValueDatetime | ParameterValueTimestamp | ParameterValueUuid | ParameterValueJsonb | ParameterValueDecimal | ParameterValueRangeInt32 | ParameterValueRangeInt64 | ParameterValueRangeDecimal | ParameterValueArrayInt32 | ParameterValueArrayInt64 | ParameterValueArrayDecimal | ParameterValueArrayStr | ParameterValueInterval | ParameterValueDbNull;
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
  export interface ParameterValueDate {
    tag: 'date',
    val: [number, number, number],
  }
  /**
   * (year, month, day)
   */
  export interface ParameterValueTime {
    tag: 'time',
    val: [number, number, number, number],
  }
  /**
   * (hour, minute, second, nanosecond)
   * Date-time types are always treated as UTC (without timezone info).
   * The instant is represented as a (year, month, day, hour, minute, second, nanosecond) tuple.
   */
  export interface ParameterValueDatetime {
    tag: 'datetime',
    val: [number, number, number, number, number, number, number],
  }
  /**
   * Unix timestamp (seconds since epoch)
   */
  export interface ParameterValueTimestamp {
    tag: 'timestamp',
    val: bigint,
  }
  export interface ParameterValueUuid {
    tag: 'uuid',
    val: string,
  }
  export interface ParameterValueJsonb {
    tag: 'jsonb',
    val: Uint8Array,
  }
  export interface ParameterValueDecimal {
    tag: 'decimal',
    val: string,
  }
  /**
   * base 10
   */
  export interface ParameterValueRangeInt32 {
    tag: 'range-int32',
    val: [[number, RangeBoundKind] | undefined, [number, RangeBoundKind] | undefined],
  }
  export interface ParameterValueRangeInt64 {
    tag: 'range-int64',
    val: [[bigint, RangeBoundKind] | undefined, [bigint, RangeBoundKind] | undefined],
  }
  export interface ParameterValueRangeDecimal {
    tag: 'range-decimal',
    val: [[string, RangeBoundKind] | undefined, [string, RangeBoundKind] | undefined],
  }
  export interface ParameterValueArrayInt32 {
    tag: 'array-int32',
    val: Array<number | undefined>,
  }
  export interface ParameterValueArrayInt64 {
    tag: 'array-int64',
    val: Array<bigint | undefined>,
  }
  export interface ParameterValueArrayDecimal {
    tag: 'array-decimal',
    val: Array<string | undefined>,
  }
  export interface ParameterValueArrayStr {
    tag: 'array-str',
    val: Array<string | undefined>,
  }
  export interface ParameterValueInterval {
    tag: 'interval',
    val: Interval,
  }
  export interface ParameterValueDbNull {
    tag: 'db-null',
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
  
  export class Connection implements Disposable {
    /**
     * This type does not have a public constructor.
     */
    private constructor();
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
    [Symbol.dispose](): void;
  }
}
