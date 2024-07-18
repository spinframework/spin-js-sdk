//@ts-ignore
import * as spinRedis from 'fermyon:spin/redis@2.0.0';

export type payload = Uint8Array;
export type redisParameter = number | Uint8Array;
export type redisResult = number | Uint8Array | null | string;

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
  publish: (channel: string, payload: payload) => void;

  /**
   * Get a value for the given key. Returns null if the key does not exist.
   * @param {string} key - The key to retrieve the value for.
   * @returns {payload | null}
   */
  get: (key: string) => payload | null;

  /**
   * Set a value for the given key.
   * @param {string} key - The key to set the value for.
   * @param {payload} value - The value to set.
   * @returns {void}
   */
  set: (key: string, value: payload) => void;

  /**
   * Increment the value of a key.
   * @param {string} key - The key to increment.
   * @returns {number}
   */
  incr: (key: string) => number;

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
   * @param {redisParameter[]} args - The arguments for the Redis command.
   * @returns {redisResult[]}
   */
  execute: (command: string, args: redisParameter[]) => redisResult[];
}

/**
 * Opens a connection to the Redis instance at the specified address.
 * @param {string} address - The address of the Redis instance.
 * @returns {RedisConnection} The Redis connection object.
 */
export function open(address: string): RedisConnection {
  return spinRedis.Connection.open(address);
}
