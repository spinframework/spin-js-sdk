interface HttpRequest {
    method: String;
    uri: String;
    headers: Array<[String, String]>;
    body?: ArrayBuffer;
}

interface SpinConfig {
    get(arg0: String): any;
}

interface SpinSDK {
    config: SpinConfig; 
}

export {HttpRequest, SpinSDK}