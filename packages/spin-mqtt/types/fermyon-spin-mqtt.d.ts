declare module 'fermyon:spin/mqtt@2.0.0' {
  /**
   * Errors related to interacting with Mqtt
   */
  export type Error =
    | ErrorInvalidAddress
    | ErrorTooManyConnections
    | ErrorConnectionFailed
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
   * Connection failure e.g. address not allowed.
   */
  export interface ErrorConnectionFailed {
    tag: 'connection-failed';
    val: string;
  }
  /**
   * Some other error occurred
   */
  export interface ErrorOther {
    tag: 'other';
    val: string;
  }
  /**
   * QoS for publishing Mqtt messages
   * # Variants
   *
   * ## `"at-most-once"`
   *
   * ## `"at-least-once"`
   *
   * ## `"exactly-once"`
   */
  export type Qos = 'at-most-once' | 'at-least-once' | 'exactly-once';
  /**
   * The message payload.
   */
  export type Payload = Uint8Array;

  export class Connection {
    /**
     * Open a connection to the Mqtt instance at `address`.
     */
    static open(
      address: string,
      username: string,
      password: string,
      keepAliveIntervalInSecs: bigint,
    ): Connection;
    /**
     * Publish an Mqtt message to the specified `topic`.
     */
    publish(topic: string, payload: Payload, qos: Qos): void;
  }
}
