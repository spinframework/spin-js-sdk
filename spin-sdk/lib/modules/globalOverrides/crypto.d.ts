interface HashAndHmac {
    update(content: string | Uint8Array, inputEncoding?: string): void;
    digest(): ArrayBuffer;
}
declare global {
    const crypto: {
        getRandomValues<T extends ArrayBufferView | null>(array: T): T;
        subtle: {
            digest(algorithm: string, content: ArrayBuffer): Promise<ArrayBuffer>;
            verify(algorithm: string, key: ArrayBuffer, signature: ArrayBuffer, data: ArrayBuffer): boolean;
        };
        createHash(algorithm: string): HashAndHmac;
        createHmac(algorithm: string, key: ArrayBuffer): HashAndHmac;
        timingSafeEqual(value1: ArrayBuffer, value2: ArrayBuffer): boolean;
        verify(algorithm: string, data: ArrayBuffer, key: ArrayBuffer, signature: ArrayBuffer): boolean;
    };
}
export {};
