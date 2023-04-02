declare global {
    function atob(data: string): string;
    function btoa(data: string): string;
    class TextEncoder {
        constructor();
        encode(string: string): Uint8Array;
    }
    class TextDecoder {
        constructor();
        decode(buffer: Uint8Array): string;
    }
}
export {};
