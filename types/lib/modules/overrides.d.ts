declare global {
    class TextEncoder {
        constructor();
        encode(string: string): Uint8Array;
    }
    class TextDecoder {
        constructor();
        decode(buffer: Uint8Array): string;
    }
    class URL {
        constructor(url: string, base?: string);
        protocol: string
        slashes: boolean
        auth: string
        username: string
        password: string
        host: string
        port: string
        pathname: string
        search: string
        hash: string
        href: string
        origin: string
        set(key: string, value: string | boolean): void
        toString(): string
    }
    class URLSearchParams {
        constructor(queryParamsString: string);
        append(key: string, val: string | Array<string>): void
        delete(key: string): void
        entries(): Iterable<[string, string]>
        get(key: string): string
        getAll(key: string): string[]
        has(key: string): boolean
        keys(): string[]
        set(key: string, val: string | Array<string>): void
        toString(): string
        values(): string[]
    }
    interface HashAndHmac {
        update(content: string | Uint8Array, inputEncoding?: string): void
        digest(): ArrayBuffer
    }
    const crypto:  {
        getRandomValues<T extends ArrayBufferView | null>(array: T): T
        subtle: {
            digest(algorithm: string, content: ArrayBuffer): Promise<ArrayBuffer>
        }
        createHash(algorithm: string): HashAndHmac
        createHmac(algorithm: string, key: ArrayBuffer): HashAndHmac
    }
}

export { }