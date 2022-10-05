export declare interface HttpRequest {
    method: String;
    uri: String;
    headers: Array<[String, String]>;
    body: ArrayBuffer | null;
}

interface SpinConfig {
    get(arg0: String): any;
}

export declare interface SpinSDK {
    config: SpinConfig; 
}