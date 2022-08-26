#![deny(warnings)]

use {
    anyhow::{anyhow, Result},
    http::{header::HeaderName, request, HeaderValue},
    once_cell::sync::OnceCell,
    quickjs_wasm_rs::{Context, Deserializer, Exception, Serializer, Value},
    serde::{Deserialize, Serialize},
    serde_bytes::ByteBuf,
    spin_sdk::{
        config,
        http::{Request, Response},
        http_component, outbound_http,
    },
    std::{
        collections::HashMap,
        io::{self, Read},
        ops::Deref,
        str,
    },
};

static mut CONTEXT: OnceCell<Context> = OnceCell::new();
static mut GLOBAL: OnceCell<Value> = OnceCell::new();
static mut ENTRYPOINT: OnceCell<Value> = OnceCell::new();
static mut ON_RESOLVE: OnceCell<Value> = OnceCell::new();
static mut ON_REJECT: OnceCell<Value> = OnceCell::new();
static mut RESPONSE: Option<Result<Value>> = None;

#[derive(Serialize, Deserialize, Debug)]
struct HttpRequest {
    method: String,
    uri: String,
    #[serde(default)]
    headers: HashMap<String, String>,
    body: Option<ByteBuf>,
}

#[derive(Serialize, Deserialize, Debug)]
struct HttpResponse {
    status: u16,
    #[serde(default)]
    headers: HashMap<String, String>,
    body: Option<ByteBuf>,
}

fn on_resolve(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args {
        [response] => {
            unsafe { RESPONSE = Some(Ok(response.clone())) }

            context.undefined_value()
        }

        _ => Err(anyhow!("expected 1 argument, got {}", args.len())),
    }
}

fn on_reject(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args {
        [error] => {
            unsafe { RESPONSE = Some(Err(Exception::from(error.clone())?.into_error())) }

            context.undefined_value()
        }

        _ => Err(anyhow!("expected 1 argument, got {}", args.len())),
    }
}

fn console_log(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    let mut spaced = false;
    for arg in args {
        if spaced {
            print!(" ");
        } else {
            spaced = true;
        }
        print!("{}", arg.as_str()?);
    }
    println!();

    context.undefined_value()
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
                        HeaderValue::from_bytes(value.as_bytes())?,
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
                    .map(|(key, value)| {
                        Ok((
                            key.as_str().to_owned(),
                            str::from_utf8(value.as_bytes())?.to_owned(),
                        ))
                    })
                    .collect::<Result<_>>()?,
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

fn do_init() -> Result<()> {
    let mut script = String::new();
    io::stdin().read_to_string(&mut script)?;

    let context = Context::default();
    context.eval_global("sdk.js", include_str!("../sdk.js"))?;
    context.eval_global("script.js", &script)?;

    let global = context.global_object()?;

    let entrypoint = global.get_property("spin")?.get_property("handleRequest")?;

    if !entrypoint.is_function() {
        panic!("expected function named \"handleRequest\" in \"spin\"");
    }

    let console = context.object_value()?;
    console.set_property("log", context.wrap_callback(console_log)?)?;

    global.set_property("console", console)?;

    let config = context.object_value()?;
    config.set_property("get", context.wrap_callback(spin_get_config)?)?;

    let http = context.object_value()?;
    http.set_property("send", context.wrap_callback(spin_send_http_request)?)?;

    let spin_sdk = context.object_value()?;
    spin_sdk.set_property("config", config)?;
    spin_sdk.set_property("http", http)?;

    global.set_property("spinSdk", spin_sdk)?;

    let on_resolve = context.wrap_callback(on_resolve)?;
    let on_reject = context.wrap_callback(on_reject)?;

    unsafe {
        CONTEXT.set(context).unwrap();
        GLOBAL.set(global).unwrap();
        ENTRYPOINT.set(entrypoint).unwrap();
        ON_RESOLVE.set(on_resolve).unwrap();
        ON_REJECT.set(on_reject).unwrap();
    }

    Ok(())
}

#[export_name = "wizer.initialize"]
pub extern "C" fn init() {
    do_init().unwrap()
}

#[http_component]
fn handle(request: Request) -> Result<Response> {
    let context;
    let global;
    let entrypoint;
    let on_resolve;
    let on_reject;

    unsafe {
        context = CONTEXT.get().unwrap();
        global = GLOBAL.get().unwrap();
        entrypoint = ENTRYPOINT.get().unwrap();
        on_resolve = ON_RESOLVE.get().unwrap();
        on_reject = ON_REJECT.get().unwrap();
    }

    let request = HttpRequest {
        method: request.method().as_str().to_owned(),
        uri: request.uri().to_string(),
        headers: request
            .headers()
            .iter()
            .map(|(key, value)| {
                Ok((
                    key.as_str().to_owned(),
                    str::from_utf8(value.as_bytes())?.to_owned(),
                ))
            })
            .collect::<Result<_>>()?,
        body: request
            .into_body()
            .map(|bytes| ByteBuf::from(bytes.deref())),
    };

    let mut serializer = Serializer::from_context(context)?;
    request.serialize(&mut serializer)?;
    let request = serializer.value;

    let promise = entrypoint.call(global, &[request])?;

    promise
        .get_property("then")?
        .call(&promise, &[on_resolve.clone(), on_reject.clone()])?;

    context.execute_pending()?;

    let response = unsafe { RESPONSE.take() }.unwrap()?;

    let deserializer = &mut Deserializer::from(response);
    let response = HttpResponse::deserialize(deserializer)?;
    let mut builder = http::Response::builder().status(response.status);
    if let Some(headers) = builder.headers_mut() {
        for (key, value) in &response.headers {
            headers.insert(
                HeaderName::try_from(key.deref())?,
                HeaderValue::from_bytes(value.as_bytes())?,
            );
        }
    }

    Ok(builder.body(response.body.map(|buffer| buffer.into_vec().into()))?)
}
