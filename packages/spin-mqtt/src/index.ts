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
   */
  publish: (topic: string, payload: Uint8Array, qos: QoS) => void;
}

/**
 * Opens an MQTT connection with the specified parameters.
 * @param {string} address - The address of the MQTT broker.
 * @param {string} username - The username for the MQTT connection.
 * @param {string} password - The password for the MQTT connection.
 * @param {bigint} keepAliveIntervalInSecs - The keep-alive interval in seconds.
 * @returns {MqttConnection} The MQTT connection object.
 */
export function open(
  address: string,
  username: string,
  password: string,
  keepAliveIntervalInSecs: bigint,
): MqttConnection {
  return spinMqtt.Connection.open(
    address,
    username,
    password,
    keepAliveIntervalInSecs,
  );
}
