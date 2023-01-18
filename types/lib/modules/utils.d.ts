/// <reference types="node" />
import { routerType } from "./router";
declare global {
    const utils: {
        toBuffer(argo: ArrayBuffer): Buffer;
        Router(): routerType;
    };
}
