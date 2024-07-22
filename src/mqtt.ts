//@ts-ignore
import * as spinMqtt from 'fermyon:spin/mqtt@2.0.0';

/**
 * Enum representing the Quality of Service (QoS) levels for MQTT.
 * @enum {string}
 */
export enum QoS {
  /** Messages are delivered at most once. */
  AtMostOnce = 'at-most-once',
  /** Messages are delivered at least once. */
  AtLeastOnce = 'at-least-once',
  /** Messages are delivered exactly once. */
  ExactlyOnce = 'exactly-once',
}

/**
 * Interface representing an MQTT connection with a method for publishing messages.
 * @interface MqttConnection
 */
export interface MqttConnection {
  /**
   * Publishes a message to the specified MQTT topic.
   * @param topic - The topic to publish the message to.
   * @param payload - The message payload as a Uint8Array.
   * @param qos - The Quality of Service level for message delivery.
   * @throws {@link ErrorOther} Some other error occurred.
   */
  publish: (topic: string, payload: Uint8Array, qos: QoS) => void;
}

/**
 * Opens an MQTT connection with the specified parameters.
 * @param {string} address - The address of the MQTT broker.
 * @param {string} username - The username for the MQTT connection.
 * @param {string} password - The password for the MQTT connection.
 * @param {number} keepAliveIntervalInSecs - The keep-alive interval in seconds.
 * @throws {@link ErrorInvalidAddress} An invalid address string.
 * @throws {@link ErrorTooManyConnections} There are too many open connections.
 * @throws {@link ErrorConnectionFailed} Connection failure, e.g., address not allowed.
 * @throws {@link ErrorOther} Some other error occurred.
 * @returns {MqttConnection} The MQTT connection object.
 */
export function open(
  address: string,
  username: string,
  password: string,
  keepAliveIntervalInSecs: number,
): MqttConnection {
  return spinMqtt.Connection.open(
    address,
    username,
    password,
    keepAliveIntervalInSecs,
  );
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
