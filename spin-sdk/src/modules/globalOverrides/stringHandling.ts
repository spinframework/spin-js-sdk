declare global {
    function atob(data:string): string
    function btoa(data:string): string 
    //@ts-ignore
    class TextEncoder {
        constructor();
        encode(string: string): Uint8Array;
    }
    //@ts-ignore
    class TextDecoder {
        constructor();
        decode(buffer: Uint8Array): string;
    }
}

export {}