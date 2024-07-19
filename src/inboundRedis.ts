/**
 * Abstract class for handling Redis messages.
 */
export abstract class RedisHandler {
  /**
   * Handles a Redis message.
   * @param msg - The message data as a Uint8Array.
   * @returns A Promise that resolves when the message has been handled.
   */
  abstract handleMessage(msg: Uint8Array): Promise<void>;
}
