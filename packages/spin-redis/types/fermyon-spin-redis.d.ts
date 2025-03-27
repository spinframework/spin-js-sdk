declare module 'fermyon:spin/redis@2.0.0' {
  /**
   * Errors related to interacting with Redis
   */
  export type Error =
    | ErrorInvalidAddress
    | ErrorTooManyConnections
    | ErrorTypeError
    | ErrorOther;
  /**
   * An invalid address string
   */
  export interface ErrorInvalidAddress {
    tag: 'invalid-address';
  }
  /**
   * There are too many open connections
   */
  export interface ErrorTooManyConnections {
    tag: 'too-many-connections';
  }
  /**
   * A retrieved value was not of the correct type
   */
  export interface ErrorTypeError {
    tag: 'type-error';
  }
  /**
   * Some other error occurred
   */
  export interface ErrorOther {
    tag: 'other';
    val: string;
  }
  /**
   * The message payload.
   */
  export type Payload = Uint8Array;
  /**
   * A parameter type for the general-purpose `execute` function.
   */
  export type RedisParameter = RedisParameterInt64 | RedisParameterBinary;
  export interface RedisParameterInt64 {
    tag: 'int64';
    val: bigint;
  }
  export interface RedisParameterBinary {
    tag: 'binary';
    val: Payload;
  }
  /**
   * A return type for the general-purpose `execute` function.
   */
  export type RedisResult =
    | RedisResultNil
    | RedisResultStatus
    | RedisResultInt64
    | RedisResultBinary;
  export interface RedisResultNil {
    tag: 'nil';
  }
  export interface RedisResultStatus {
    tag: 'status';
    val: string;
  }
  export interface RedisResultInt64 {
    tag: 'int64';
    val: bigint;
  }
  export interface RedisResultBinary {
    tag: 'binary';
    val: Payload;
  }

  export class Connection {
    /**
     * Open a connection to the Redis instance at `address`.
     */
    static open(address: string): Connection;
    /**
     * Publish a Redis message to the specified channel.
     */
    publish(channel: string, payload: Payload): void;
    /**
     * Get the value of a key.
     */
    get(key: string): Payload | undefined;
    /**
     * Set key to value.
     *
     * If key already holds a value, it is overwritten.
     */
    set(key: string, value: Payload): void;
    /**
     * Increments the number stored at key by one.
     *
     * If the key does not exist, it is set to 0 before performing the operation.
     * An `error::type-error` is returned if the key contains a value of the wrong type
     * or contains a string that can not be represented as integer.
     */
    incr(key: string): bigint;
    /**
     * Removes the specified keys.
     *
     * A key is ignored if it does not exist. Returns the number of keys deleted.
     */
    del(keys: Array<string>): number;
    /**
     * Add the specified `values` to the set named `key`, returning the number of newly-added values.
     */
    sadd(key: string, values: Array<string>): number;
    /**
     * Retrieve the contents of the set named `key`.
     */
    smembers(key: string): Array<string>;
    /**
     * Remove the specified `values` from the set named `key`, returning the number of newly-removed values.
     */
    srem(key: string, values: Array<string>): number;
    /**
     * Execute an arbitrary Redis command and receive the result.
     */
    execute(
      command: string,
      arguments: Array<RedisParameter>,
    ): Array<RedisResult>;
  }
}
