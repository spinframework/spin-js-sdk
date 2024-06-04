type ResolveFunction = (value: Response | PromiseLike<Response>) => void;

export class ResponseBuilder {
  headers: Headers = new Headers();
  statusCode: number = 200;
  private hasWrittenHeaders: boolean = false;
  private hasSentResponse: boolean = false;
  private resolveFunction: ResolveFunction;
  private streamController: any;

  constructor(resolve: ResolveFunction) {
    this.resolveFunction = resolve;
  }
  status(code: number): ResponseBuilder {
    if (this.hasWrittenHeaders) {
      throw new Error('Headers and Status already sent');
    }
    this.statusCode = code;
    return this;
  }
  getStatus(): number {
    return this.statusCode;
  }
  set(
    arg1: string | { [key: string]: string } | Headers,
    arg2?: string,
  ): ResponseBuilder {
    if (this.hasWrittenHeaders) {
      throw new Error('Headers already sent');
    }
    if (typeof arg1 === 'string' && typeof arg2 === 'string') {
      this.headers.set(arg1, arg2);
    } else if (typeof arg1 === 'object' && arg1 instanceof Headers) {
      arg1.forEach((value, key) => {
        this.headers.set(key, value);
      });
    } else if (typeof arg1 === 'object' && arg2 === undefined) {
      for (const key in arg1) {
        this.headers.set(key, arg1[key]);
      }
    } else {
      throw new Error('Invalid arguments');
    }
    return this;
  }
  send(value: BodyInit = new Uint8Array()) {
    if (this.hasSentResponse) {
      throw new Error('Response has already been sent');
    }
    if (!this.hasWrittenHeaders) {
      this.resolveFunction(
        new Response(value, { headers: this.headers, status: this.statusCode }),
      );
      this.hasWrittenHeaders = true;
    } else {
      this.write(value);
    }
    this.end();
    this.hasSentResponse = true;
  }
  write(value: BodyInit) {
    if (this.hasSentResponse) {
      throw new Error('Response has already been sent');
    }
    if (!this.hasWrittenHeaders) {
      let temp;
      let readableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(convertToUint8Array(value));
          let streamController = {
            pump: (value: BodyInit) => {
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
      this.resolveFunction(
        new Response(readableStream, {
          headers: this.headers,
          status: this.statusCode,
        }),
      );
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

function convertToUint8Array(body: BodyInit): Uint8Array {
  if (body instanceof ArrayBuffer) {
    return new Uint8Array(body);
  } else if (ArrayBuffer.isView(body)) {
    return new Uint8Array(body.buffer, body.byteOffset, body.byteLength);
  } else if (typeof body === 'string') {
    const encoder = new TextEncoder();
    const utf8Array = encoder.encode(body);
    return utf8Array;
  } else if (body instanceof URLSearchParams) {
    const encoder = new TextEncoder();
    const bodyString = body.toString();
    const utf8Array = encoder.encode(bodyString);
    return utf8Array;
  } else {
    throw new Error('Unsupported body type');
  }
}
