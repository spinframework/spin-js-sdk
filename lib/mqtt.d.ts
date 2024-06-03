export declare enum QoS {
    AtMostOnce = "at-most-once",
    AtLeastOnce = "at-least-once",
    ExactlyOnce = "exactly-once"
}
export interface MqttConnection {
    publish: (topic: string, payload: Uint8Array, qos: QoS) => void;
}
export declare function open(address: string, username: string, password: string, keepAliveIntervalInSecs: number): MqttConnection;
