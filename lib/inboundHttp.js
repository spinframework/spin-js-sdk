export class ResponseBuilder {
    constructor(resolve) {
        this.headers = new Headers();
        this.statusCode = 200;
        this.hasWrittenHeaders = false;
        this.hasSentResponse = false;
        this.resolveFunction = resolve;
    }
    status(code) {
        if (this.hasWrittenHeaders) {
            throw new Error('Headers and Status already sent');
        }
        this.statusCode = code;
        return this;
    }
    getStatus() {
        return this.statusCode;
    }
    set(arg1, arg2) {
        if (this.hasWrittenHeaders) {
            throw new Error('Headers already sent');
        }
        if (typeof arg1 === 'string' && typeof arg2 === 'string') {
            this.headers.set(arg1, arg2);
        }
        else if (typeof arg1 === 'object' && arg2 === undefined) {
            for (const key in arg1) {
                this.headers.set(key, arg1[key]);
            }
        }
        else {
            throw new Error('Invalid arguments');
        }
        return this;
    }
    send(value = new Uint8Array()) {
        if (this.hasSentResponse) {
            throw new Error('Response has already been sent');
        }
        if (!this.hasWrittenHeaders) {
            this.resolveFunction(new Response(value, { headers: this.headers, status: this.statusCode }));
            this.hasWrittenHeaders = true;
        }
        else {
            this.write(value);
        }
        this.end();
        this.hasSentResponse = true;
    }
    write(value) {
        if (this.hasSentResponse) {
            throw new Error('Response has already been sent');
        }
        if (!this.hasWrittenHeaders) {
            let temp;
            let readableStream = new ReadableStream({
                start(controller) {
                    controller.enqueue(convertToUint8Array(value));
                    let streamController = {
                        pump: (value) => {
                            controller.enqueue(convertToUint8Array(value));
                        },
                        close: () => {
                            controller.close();
                        },
                    };
                    temp = streamController;
                },
            });
            this.streamController = temp;
            this.resolveFunction(new Response(readableStream, {
                headers: this.headers,
                status: this.statusCode,
            }));
            this.hasWrittenHeaders = true;
            return;
        }
        this.streamController.pump(convertToUint8Array(value));
    }
    end() {
        if (this.hasSentResponse) {
            throw new Error('Response has already been sent');
        }
        // close stream
        this.streamController.close();
        this.hasSentResponse = true;
    }
}
function convertToUint8Array(body) {
    if (body instanceof ArrayBuffer) {
        return new Uint8Array(body);
    }
    else if (ArrayBuffer.isView(body)) {
        return new Uint8Array(body.buffer, body.byteOffset, body.byteLength);
    }
    else if (typeof body === 'string') {
        const encoder = new TextEncoder();
        const utf8Array = encoder.encode(body);
        return utf8Array;
    }
    else if (body instanceof URLSearchParams) {
        const encoder = new TextEncoder();
        const bodyString = body.toString();
        const utf8Array = encoder.encode(bodyString);
        return utf8Array;
    }
    else {
        throw new Error('Unsupported body type');
    }
}
