//@ts-ignore
import * as spinMqtt from "fermyon:spin/mqtt@2.0.0"
export enum QoS {
    AtMostOnce = "at-most-once",
    AtLeastOnce = "at-least-once",
    ExactlyOnce = "exactly-once"
}

export interface MqttConnection {
    publish: (topic: string, payload: Uint8Array, qos: QoS) => void
}

export function open(address: string, username: string, password: string, keepAliveIntervalInSecs: number): MqttConnection {
    return spinMqtt.Connection.open(address, username, password, keepAliveIntervalInSecs)
}
