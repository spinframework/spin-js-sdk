declare global {
    //@ts-ignore
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
        toJson(): string
    }
    //@ts-ignore
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
}

export {}