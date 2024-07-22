//@ts-ignore
import * as spinRedis from 'fermyon:spin/redis@2.0.0';

export type Payload = Uint8Array;
export type RedisParameter = RedisParameterInt64 | RedisParameterBinary;
export interface RedisParameterInt64 {
  tag: 'int64';
  val: bigint;
}
export interface RedisParameterBinary {
  tag: 'binary';
  val: Payload;
}

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

/**
 * Interface representing a Redis connection with various methods for interacting with Redis.
 * @interface RedisConnection
 */
export interface RedisConnection {
  /**
   * Publish a Redis message to the specified channel.
   * @param {string} channel - The channel to publish the message to.
   * @param {payload} payload - The message payload.
   * @throws {@link ErrorTypeError} A retrieved value was not of the correct type.
   * @throws {@link ErrorOther} Some other error occurred.
   * @returns {void}
   */
  publish: (channel: string, payload: Payload) => void;

  /**
   * Get a value for the given key. Returns null if the key does not exist.
   * @param {string} key - The key to retrieve the value for.
   * @throws {@link ErrorTypeError} A retrieved value was not of the correct type.
   * @throws {@link ErrorOther} Some other error occurred.
   * @returns {Payload | null}
   */
  get: (key: string) => Payload | undefined;

  /**
   * Set a value for the given key.
   * @param {string} key - The key to set the value for.
   * @param {Payload} value - The value to set.
   * @throws {@link ErrorTypeError} A retrieved value was not of the correct type.
   * @throws {@link ErrorOther} Some other error occurred.
   * @returns {void}
   */
  set: (key: string, value: Payload) => void;

  /**
   * Increment the value of a key.
   * @param {string} key - The key to increment.
   * @throws {@link ErrorTypeError} A retrieved value was not of the correct type.
   * @throws {@link ErrorOther} Some other error occurred.
   * @returns {number}
   */
  incr: (key: string) => bigint;

  /**
   * Deletes the given key.
   * @param {string} key - The key to delete.
   * @throws {@link ErrorTypeError} A retrieved value was not of the correct type.
   * @throws {@link ErrorOther} Some other error occurred.
   * @returns {number}
   */
  del: (key: string) => number;

  /**
   * Adds a value to a set.
   * @param {string} key - The key of the set.
   * @param {string[]} value - The values to add to the set.
   * @throws {@link ErrorTypeError} A retrieved value was not of the correct type.
   * @throws {@link ErrorOther} Some other error occurred.
   * @returns {number}
   */
  sadd: (key: string, value: string[]) => number;

  /**
   * Retrieves the members of a set.
   * @param {string} key - The key of the set.
   * @throws {@link ErrorTypeError} A retrieved value was not of the correct type.
   * @throws {@link ErrorOther} Some other error occurred.
   * @returns {string[]}
   */
  smembers: (key: string) => string[];

  /**
   * Removes values from a set.
   * @param {string} key - The key of the set.
   * @param {string[]} value - The values to remove from the set.
   * @throws {@link ErrorTypeError} A retrieved value was not of the correct type.
   * @throws {@link ErrorOther} Some other error occurred.
   * @returns {number}
   */
  srem: (key: string, value: string[]) => number;

  /**
   * Execute an arbitrary Redis command and receive the result.
   * @param {string} command - The Redis command to execute.
   * @param {RedisParameter[]} args - The arguments for the Redis command.
   * @throws {@link ErrorTypeError} A retrieved value was not of the correct type.
   * @throws {@link ErrorOther} Some other error occurred.
   * @returns {RedisResult[]}
   */
  execute: (command: string, args: RedisParameter[]) => RedisResult[];
}

/**
 * Opens a connection to the Redis instance at the specified address.
 * @param {string} address - The address of the Redis instance.
 * @throws {@link ErrorInvalidAddress} An invalid address string.
 * @throws {@link ErrorTooManyConnections} There are too many open connections.
 * @throws {@link ErrorOther} Some other error occurred.
 * @returns {RedisConnection} The Redis connection object.
 */
export function open(address: string): RedisConnection {
  return spinRedis.Connection.open(address);
}

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
