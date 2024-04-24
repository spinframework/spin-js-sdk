//@ts-ignore
import * as spinMqtt from "fermyon:spin/mqtt@2.0.0";
export var QoS;
(function (QoS) {
    QoS["AtMostOnce"] = "at-most-once";
    QoS["AtLeastOnce"] = "at-least-once";
    QoS["ExactlyOnce"] = "exactly-once";
})(QoS || (QoS = {}));
export function open(address, username, password, keepAliveIntervalInSecs) {
    return spinMqtt.Connection.open(address, username, password, keepAliveIntervalInSecs);
}
