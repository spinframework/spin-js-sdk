function log(...args: any) {
    // Do we want this hack - allows printing functions nested in objects.
    // otherwise, it skips over it - follows the output similar to node
    //@ts-ignore
    Function.prototype.toJSON = function () { return `[Function: ${this.name}]`; }
    let ret = Array.from(args).map(k => {
        if (typeof (k) === 'object') {
            return JSON.stringify(k, null, 2)
        } else if (typeof (k) === 'function') {
            return `[Function: ${k.name}]`
        }
        return k
    })
    // Remove the hack to not affect when running JSON.stringify by itself
    //@ts-ignore
    delete Function.prototype.toJSON
    __internal__.console.log(...ret)
}

const console = {
    log: (...args: any) => { log(...args) }
}

export { console }