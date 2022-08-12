use {
    anyhow::Result,
    bytes::Bytes,
    http::{header::HeaderName, HeaderValue},
    once_cell::sync::OnceCell,
    quickjs_wasm_rs::{Context, Deserializer, Serializer, Value},
    serde::{Deserialize, Serialize},
    spin_sdk::{
        http::{Request, Response},
        http_component,
    },
    std::{
        collections::BTreeMap,
        io::{self, Read},
        ops::Deref,
    },
};

// #[cfg(not(test))]
// #[global_allocator]
// static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

static mut CONTEXT: OnceCell<Context> = OnceCell::new();
static mut GLOBAL: OnceCell<Value> = OnceCell::new();
static mut ENTRYPOINT: OnceCell<Value> = OnceCell::new();

#[export_name = "wizer.initialize"]
pub extern "C" fn init() {
    let mut global = Vec::new();
    io::stdin().read_to_end(&mut global).unwrap();

    let context = Context::default();
    context.eval_binary(&global).unwrap();
    let global = context.global_object().unwrap();
    let entrypoint = global.get_property("handleRequest").unwrap();
    if !entrypoint.is_function() {
        panic!("expected function named \"handleRequest\"");
    }

    unsafe {
        CONTEXT.set(context).unwrap();
        GLOBAL.set(global).unwrap();
        ENTRYPOINT.set(entrypoint).unwrap();
    }
}

#[derive(Serialize)]
struct MyRequest<'a> {
    headers: BTreeMap<&'a str, &'a [u8]>,
    body: Option<&'a [u8]>,
}

#[derive(Deserialize)]
struct MyResponse {
    status: u16,
    headers: BTreeMap<Box<str>, Box<str>>,
    body: Option<Box<str>>,
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

    let request = MyRequest {
        headers: request
            .headers()
            .iter()
            .map(|(key, value)| (key.as_str(), value.as_bytes()))
            .collect(),
        body: request.body().as_ref().map(|bytes| bytes.deref()),
    };

    let mut serializer = Serializer::from_context(context)?;
    request.serialize(&mut serializer)?;
    let request = serializer.value;

    let response = entrypoint.call(global, &[request])?;

    let mut deserializer = Deserializer::from(response);
    let response = MyResponse::deserialize(&mut deserializer)?;
    let mut builder = http::Response::builder().status(response.status);
    if let Some(headers) = builder.headers_mut() {
        for (key, value) in &response.headers {
            headers.insert(
                HeaderName::try_from(key.deref())?,
                HeaderValue::from_str(value)?,
            );
        }
    }

    Ok(builder.body(
        response
            .body
            .map(|bytes| Bytes::copy_from_slice(bytes.as_bytes())),
    )?)
}
