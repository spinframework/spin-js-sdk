interface UrlObject {
    protocol: string;
    slashes: boolean;
    auth: string;
    username: string;
    password: string;
    host: string;
    port: string;
    pathname: string;
    query: string;
    hash: string;
    href: string;
    origin: string;
    set(key: string, value: string | boolean): void;
    toString(): string;
}
declare class URL implements UrlObject {
    protocol: string;
    slashes: boolean;
    auth: string;
    username: string;
    password: string;
    host: string;
    port: string;
    pathname: string;
    query: string;
    hash: string;
    href: string;
    origin: string;
    constructor(urlStr: string, base?: undefined);
    set(key: string, value: string | boolean): void;
    toString(): string;
}
export { URL };
