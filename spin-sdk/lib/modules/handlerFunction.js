import 'fast-text-encoding';
let encoder = new TextEncoder();
let decoder = new TextDecoder();
class ResponseBuilder {
    constructor() {
        this.response = {
            status: 200,
            headers: {}
        };
        this.statusCode = this.response.status;
    }
    getHeader(key) {
        return this.response.headers[key] || null;
    }
    header(key, value) {
        this.response.headers[key] = value;
        return this;
    }
    status(status) {
        this.response.status = status;
        this.statusCode = this.response.status;
        return this;
    }
    body(data) {
        this.response.body = encodeBody(data);
        return this;
    }
}
function encodeBody(body) {
    if (typeof (body) == "string") {
        return encoder.encode(body).buffer;
    }
    else if (ArrayBuffer.isView(body)) {
        return body.buffer;
    }
    else {
        return body;
    }
}
