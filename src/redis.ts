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
   * @returns {void}
   */
  publish: (channel: string, payload: Payload) => void;

  /**
   * Get a value for the given key. Returns null if the key does not exist.
   * @param {string} key - The key to retrieve the value for.
   * @returns {Payload | null}
   */
  get: (key: string) => Payload | undefined;

  /**
   * Set a value for the given key.
   * @param {string} key - The key to set the value for.
   * @param {Payload} value - The value to set.
   * @returns {void}
   */
  set: (key: string, value: Payload) => void;

  /**
   * Increment the value of a key.
   * @param {string} key - The key to increment.
   * @returns {number}
   */
  incr: (key: string) => bigint;

  /**
   * Deletes the given key.
   * @param {string} key - The key to delete.
   * @returns {number}
   */
  del: (key: string) => number;

  /**
   * Adds a value to a set.
   * @param {string} key - The key of the set.
   * @param {string[]} value - The values to add to the set.
   * @returns {number}
   */
  sadd: (key: string, value: string[]) => number;

  /**
   * Retrieves the members of a set.
   * @param {string} key - The key of the set.
   * @returns {string[]}
   */
  smembers: (key: string) => string[];

  /**
   * Removes values from a set.
   * @param {string} key - The key of the set.
   * @param {string[]} value - The values to remove from the set.
   * @returns {number}
   */
  srem: (key: string, value: string[]) => number;

  /**
   * Execute an arbitrary Redis command and receive the result.
   * @param {string} command - The Redis command to execute.
   * @param {RedisParameter[]} args - The arguments for the Redis command.
   * @returns {RedisResult[]}
   */
  execute: (command: string, args: RedisParameter[]) => RedisResult[];
}

/**
 * Opens a connection to the Redis instance at the specified address.
 * @param {string} address - The address of the Redis instance.
 * @returns {RedisConnection} The Redis connection object.
 */
export function open(address: string): RedisConnection {
  return spinRedis.Connection.open(address);
}
