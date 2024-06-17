type ResolveFunction = (value: Response | PromiseLike<Response>) => void;

export class ResponseBuilder {
  headers: Headers = new Headers();
  statusCode: number = 200;
  private hasWrittenHeaders: boolean = false;
  private hasSentResponse: boolean = false;
  private resolveFunction: ResolveFunction;
  private internalWriter: WritableStreamDefaultWriter<any> | undefined;

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
  send(value?: BodyInit) {
    if (this.hasSentResponse) {
      throw new Error('Response has already been sent');
    }
    // If headers have not already been sent, Set the value on the engine and
    // let it take care of setting content type/length headers
    if (!this.hasWrittenHeaders) {
      this.resolveFunction(
        new Response(value, { headers: this.headers, status: this.statusCode }),
      );
      this.hasWrittenHeaders = true;
    } else {
      // If headers have been sent already, it is a streaming response, continue
      // writing to Readable stream
      if (value) {
        this.write(value);
      }
      this.end();
    }
    this.hasSentResponse = true;
  }
  write(value: BodyInit) {
    if (this.hasSentResponse) {
      throw new Error('Response has already been sent');
    }
    let contents = convertToUint8Array(value);
    if (!this.hasWrittenHeaders) {
      let { readable, writable } = new TransformStream();
      this.internalWriter = writable.getWriter();
      this.resolveFunction(
        new Response(readable, {
          headers: this.headers,
          status: this.statusCode,
        }),
      );
      this.hasWrittenHeaders = true;
    }
    this.internalWriter!.write(contents);
    return;
  }
  end() {
    if (this.hasSentResponse) {
      throw new Error('Response has already been sent');
    }
    // Not a streaming response, use 'send()' directly to send reponse.
    if (!this.internalWriter) {
      this.send();
    }
    // close stream
    this.internalWriter!.close();
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
