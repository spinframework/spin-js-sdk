export declare enum QoS {
    AtMostOnce = "at-most-once",
    AtLeastOnce = "at-least-once",
    ExactlyOnce = "exactly-once"
}
export interface SpinMqttConnection {
    publish: (topic: string, payload: Uint8Array, qos: QoS) => void;
}
export declare const Mqtt: {
    open: (address: string, username: string, password: string, keepAliveIntervalInSecs: number) => SpinMqttConnection;
};
