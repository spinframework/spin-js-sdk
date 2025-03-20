declare module 'fermyon:spin/sqlite@2.0.0' {
  /**
   * The set of errors which may be raised by functions in this interface
   */
  export type Error =
    | ErrorNoSuchDatabase
    | ErrorAccessDenied
    | ErrorInvalidConnection
    | ErrorDatabaseFull
    | ErrorIo;
  /**
   * The host does not recognize the database name requested.
   */
  export interface ErrorNoSuchDatabase {
    tag: 'no-such-database';
  }
  /**
   * The requesting component does not have access to the specified database (which may or may not exist).
   */
  export interface ErrorAccessDenied {
    tag: 'access-denied';
  }
  /**
   * The provided connection is not valid
   */
  export interface ErrorInvalidConnection {
    tag: 'invalid-connection';
  }
  /**
   * The database has reached its capacity
   */
  export interface ErrorDatabaseFull {
    tag: 'database-full';
  }
  /**
   * Some implementation-specific error has occurred (e.g. I/O)
   */
  export interface ErrorIo {
    tag: 'io';
    val: string;
  }
  /**
   * A single column's result from a database query
   */
  export type Value =
    | ValueInteger
    | ValueReal
    | ValueText
    | ValueBlob
    | ValueNull;
  export interface ValueInteger {
    tag: 'integer';
    val: bigint;
  }
  export interface ValueReal {
    tag: 'real';
    val: number;
  }
  export interface ValueText {
    tag: 'text';
    val: string;
  }
  export interface ValueBlob {
    tag: 'blob';
    val: Uint8Array;
  }
  export interface ValueNull {
    tag: 'null';
  }
  /**
   * A set of values for each of the columns in a query-result
   */
  export interface RowResult {
    values: Array<Value>;
  }
  /**
   * A result of a query
   */
  export interface QueryResult {
    /**
     * The names of the columns retrieved in the query
     */
    columns: Array<string>;
    /**
     * the row results each containing the values for all the columns for a given row
     */
    rows: Array<RowResult>;
  }

  export class Connection {
    /**
     * Open a connection to a named database instance.
     *
     * If `database` is "default", the default instance is opened.
     *
     * `error::no-such-database` will be raised if the `name` is not recognized.
     */
    static open(database: string): Connection;
    /**
     * Execute a statement returning back data if there is any
     */
    execute(statement: string, parameters: Array<Value>): QueryResult;
  }
}
