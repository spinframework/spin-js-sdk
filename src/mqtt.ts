//@ts-ignore
import * as spinMqtt from "fermyon:spin/mqtt@2.0.0"
export enum QoS {
    AtMostOnce = "at-most-once",
    AtLeastOnce = "at-least-once",
    ExactlyOnce = "exactly-once"
}

export interface SpinMqttConnection {
    publish: (topic: string, payload: Uint8Array, qos: QoS) => void
}

export const Mqtt = {
    open: (address: string, username: string, password: string, keepAliveIntervalInSecs: number): SpinMqttConnection => {
        return spinMqtt.Connection.open(address, username, password, keepAliveIntervalInSecs)
    }
}