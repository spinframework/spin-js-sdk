/** @internal */
const Url = require('url-parse')

interface UrlObject {
    protocol: string
    slashes: boolean
    auth: string
    username: string
    password: string
    host: string
    port: string
    pathname: string
    query: string
    hash: string
    href: string
    origin: string
    set(key: string, value: string | boolean): void
    toString(): string
}

class URL implements UrlObject {
    /** @internal */
    url: UrlObject
    protocol: string
    slashes: boolean
    auth: string
    username: string
    password: string
    host: string
    port: string
    pathname: string
    query: string
    hash: string
    href: string
    origin: string

    constructor(urlStr: string, base = undefined) {
        let url:UrlObject = Url(urlStr, base)
        this.url = url
        this.protocol = url.protocol
        this.slashes = url.slashes 
        this.auth = url.auth
        this.username =  url.username
        this.password =  url.password
        this.host = url.host
        this.port = url.port
        this.pathname = url.pathname
        this.query = url.query
        this.hash = url.hash
        this.href = url.origin
        this.origin = url.origin
    }

    set(key: string, value: string | boolean) {
        this.url.set(key, value)
    }

    toString() {
        return this.url.toString()
    }

}

export { URL }