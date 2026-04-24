declare class TextEncoder {
    constructor(encoding?: string);
    readonly encoding: string;
    encode(input?: string): Uint8Array;
}

declare class TextDecoder {
    constructor(label?: string, options?: { fatal?: boolean; ignoreBOM?: boolean });
    readonly encoding: string;
    readonly fatal: boolean;
    readonly ignoreBOM: boolean;
    decode(input?: ArrayBufferView | ArrayBuffer, options?: { stream?: boolean }): string;
}
