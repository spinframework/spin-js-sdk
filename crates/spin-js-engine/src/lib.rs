#![deny(warnings)]

use {
    anyhow::{anyhow, Result},
    http::{header::HeaderName, request, HeaderValue},
    once_cell::sync::OnceCell,
    quickjs_wasm_rs::{Context, Deserializer, Serializer, Value},
    serde::{Deserialize, Serialize},
    serde_bytes::ByteBuf,
    spin_sdk::{
        config,
        http::{Request, Response},
        http_component, outbound_http,
    },
    std::{
        io::{self, Read},
        ops::Deref,
        str,
    },
};

static mut CONTEXT: OnceCell<Context> = OnceCell::new();
static mut GLOBAL: OnceCell<Value> = OnceCell::new();
static mut ENTRYPOINT: OnceCell<Value> = OnceCell::new();

#[derive(Serialize, Deserialize)]
struct HttpRequest {
    method: String,
    uri: String,
    #[serde(default)]
    headers: Vec<(String, ByteBuf)>,
    body: Option<ByteBuf>,
}

#[derive(Serialize, Deserialize)]
struct HttpResponse {
    status: u16,
    #[serde(default)]
    headers: Vec<(String, ByteBuf)>,
    body: Option<ByteBuf>,
}

fn spin_get_config(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args {
        [key] => context.value_from_str(&config::get(key.as_str()?)?),

        _ => Err(anyhow!("expected 1 argument, got {}", args.len())),
    }
}

fn spin_send_http_request(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args {
        [request] => {
            let deserializer = &mut Deserializer::from(request.clone());
            let request = HttpRequest::deserialize(deserializer)?;

            let mut builder = request::Builder::new()
                .method(request.method.deref())
                .uri(request.uri.deref());

            if let Some(headers) = builder.headers_mut() {
                for (key, value) in &request.headers {
                    headers.insert(
                        HeaderName::from_bytes(key.as_bytes())?,
                        HeaderValue::from_bytes(value)?,
                    );
                }
            }

            let response = outbound_http::send_request(
                builder.body(request.body.map(|buffer| buffer.into_vec().into()))?,
            )?;

            let response = HttpResponse {
                status: response.status().as_u16(),
                headers: response
                    .headers()
                    .iter()
                    .map(|(key, value)| (key.as_str().to_owned(), ByteBuf::from(value.as_bytes())))
                    .collect(),
                body: response
                    .into_body()
                    .map(|bytes| ByteBuf::from(bytes.deref())),
            };

            let mut serializer = Serializer::from_context(context)?;
            response.serialize(&mut serializer)?;
            Ok(serializer.value)
        }

        _ => Err(anyhow!("expected 1 argument, got {}", args.len())),
    }
}

#[export_name = "wizer.initialize"]
pub extern "C" fn init() {
    let mut global = Vec::new();
    io::stdin().read_to_end(&mut global).unwrap();

    let context = Context::default();
    context.eval_binary(&global).unwrap();

    let global = context.global_object().unwrap();

    let entrypoint = global
        .get_property("spin")
        .unwrap()
        .get_property("handleRequest")
        .unwrap();

    if !entrypoint.is_function() {
        panic!("expected function named \"handleRequest\" in \"spin\"");
    }

    let config = context.object_value().unwrap();
    config
        .set_property("get", context.wrap_callback(spin_get_config).unwrap())
        .unwrap();

    let http = context.object_value().unwrap();
    http.set_property(
        "send",
        context.wrap_callback(spin_send_http_request).unwrap(),
    )
    .unwrap();

    let spin_sdk = context.object_value().unwrap();
    spin_sdk.set_property("config", config).unwrap();
    spin_sdk.set_property("http", http).unwrap();

    global.set_property("spinSdk", spin_sdk).unwrap();

    unsafe {
        CONTEXT.set(context).unwrap();
        GLOBAL.set(global).unwrap();
        ENTRYPOINT.set(entrypoint).unwrap();
    }
}

#[http_component]
fn handle(request: Request) -> Result<Response> {
    let context;
    let global;
    let entrypoint;

    unsafe {
        context = CONTEXT.get().unwrap();
        global = GLOBAL.get().unwrap();
        entrypoint = ENTRYPOINT.get().unwrap();
    }

    let request = HttpRequest {
        method: request.method().as_str().to_owned(),
        uri: request.uri().to_string(),
        headers: request
            .headers()
            .iter()
            .map(|(key, value)| (key.as_str().to_owned(), ByteBuf::from(value.as_bytes())))
            .collect(),
        body: request
            .into_body()
            .map(|bytes| ByteBuf::from(bytes.deref())),
    };

    let mut serializer = Serializer::from_context(context)?;
    request.serialize(&mut serializer)?;
    let request = serializer.value;

    let response = entrypoint.call(global, &[request])?;

    let deserializer = &mut Deserializer::from(response);
    let response = HttpResponse::deserialize(deserializer)?;
    let mut builder = http::Response::builder().status(response.status);
    if let Some(headers) = builder.headers_mut() {
        for (key, value) in &response.headers {
            headers.insert(
                HeaderName::try_from(key.deref())?,
                HeaderValue::from_bytes(value)?,
            );
        }
    }

    Ok(builder.body(response.body.map(|buffer| buffer.into_vec().into()))?)
}
