/** @internal */
const Url = require('url-parse')
/** @internal */
const _queryString = require('query-string');

interface UrlObject {
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

/** @internal */
class URL implements UrlObject {
    url: UrlObject
    protocol: string
    slashes: boolean
    auth: string
    username: string
    password: string
    host: string
    port: string
    pathname: string
    search: string
    searchParams: URLSearchParams
    hash: string
    href: string
    origin: string

    constructor(urlStr: string, base = undefined) {
        let url = Url(urlStr, base)
        this.url = url
        this.protocol = url.protocol
        this.slashes = url.slashes
        this.auth = url.auth
        this.username = url.username
        this.password = url.password
        this.host = url.host
        this.port = url.port
        this.pathname = url.pathname
        this.search = url.query
        this.searchParams = new URLSearchParams(this.search)
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

/** @internal */
class URLSearchParams {
    queryParams: { [key: string]: string | Array<string> } = {}

    constructor(val: string) {
        this.queryParams = {
            ..._queryString.parse(val)
        }
    }
    append(key: string, val: string | Array<string>) {
        this.queryParams[key] = val
    }
    delete(key: string) {
        delete this.queryParams[key]
    }
    entries() {
        return Object.entries(this.queryParams)
    }
    get(key: string) {
        let val = this.queryParams[key]
        if (val) {
            if (typeof (val) == "object") {
                return val[0]
            }
            return val
        }
        return null
    }
    getAll(key: string) {
        let val = this.queryParams[key]
        if (val) {
            return val
        }
        return null
    }
    has(key: string) {
        return this.queryParams[key] != undefined ? true : false
    }
    keys() {
        return Object.keys(this.queryParams)
    }
    set(key: string, val: string | Array<string>) {
        this.queryParams[key] = val
    }
    toString() {
        return _queryString.stringify(this.queryParams)
    }
    values() {
        return Object.keys(this.queryParams).map(k => this.queryParams[k])
    }
}

/** @internal */
export { URL, URLSearchParams }