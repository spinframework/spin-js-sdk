use {
    anyhow::{Error, Result},
    bytes::Bytes,
    http::{header::HeaderName, request, HeaderValue},
    once_cell::sync::OnceCell,
    quickjs_wasm_rs::{Context, Deserializer, Serializer, Value},
    quickjs_wasm_sys::{
        ext_js_exception, JSContext, JSValue, JS_FreeCString, JS_NewStringLen, JS_ToCStringLen2,
    },
    serde::{Deserialize, Serialize},
    spin_sdk::{
        config,
        http::{Request, Response},
        http_component, outbound_http,
    },
    std::{
        borrow::Cow,
        collections::BTreeMap,
        io::{self, Read},
        ops::Deref,
        os::raw::c_int,
        slice, str,
    },
};

static mut CONTEXT: OnceCell<Context> = OnceCell::new();
static mut GLOBAL: OnceCell<Value> = OnceCell::new();
static mut ENTRYPOINT: OnceCell<Value> = OnceCell::new();

#[derive(Serialize)]
struct InboundRequest<'a> {
    headers: BTreeMap<&'a str, &'a [u8]>,
    body: Option<&'a [u8]>,
}

#[derive(Deserialize)]
struct InboundResponse {
    status: u16,
    headers: BTreeMap<Box<str>, Box<str>>, // TODO: use Box<[u8]> for values
    body: Option<Box<str>>,                // TODO: use Box<[u8]>
}

#[derive(Deserialize)]
struct OutboundRequest {
    method: Box<str>,
    uri: Box<str>,
    #[serde(default)]
    headers: BTreeMap<Box<str>, Box<str>>, // TODO: use Box<[u8]> for values
    body: Option<Box<str>>, // TODO: use Box<[u8]>
}

#[derive(Serialize)]
struct OutboundResponse<'a> {
    status: u16,
    headers: BTreeMap<&'a str, Cow<'a, str>>, // TODO: use &'a [u8] for values
    body: Option<Cow<'a, str>>,               // TODO: use &'a [u8]
}

unsafe fn spin_get_config(
    ctx: *mut JSContext,
    _this: JSValue,
    argc: c_int,
    argv: *mut JSValue,
    _magic: c_int,
) -> JSValue {
    if argc == 1 {
        let mut key_length = 0;
        let key_ptr = JS_ToCStringLen2(ctx, &mut key_length, *argv, 0);
        if key_ptr.is_null() {
            return ext_js_exception;
        }

        let value = str::from_utf8(slice::from_raw_parts(
            key_ptr as *const u8,
            key_length as usize,
        ))
        .map_err(Error::from)
        .and_then(|key| config::get(key).map_err(Error::from));

        JS_FreeCString(ctx, key_ptr);

        match value {
            Ok(value) => JS_NewStringLen(ctx, value.as_ptr() as _, value.len() as _),
            Err(e) => {
                eprintln!("{e:?}");
                ext_js_exception
            }
        }
    } else {
        ext_js_exception
    }
}

fn send_http_request(context: &Context, request: Value) -> Result<Value> {
    let request = OutboundRequest::deserialize(&mut Deserializer::from(request))?;

    let mut builder = request::Builder::new()
        .method(request.method.deref())
        .uri(request.uri.deref());

    if let Some(headers) = builder.headers_mut() {
        for (key, value) in &request.headers {
            headers.insert(
                HeaderName::from_bytes(key.as_bytes())?,
                HeaderValue::from_str(value.deref())?,
            );
        }
    }

    let response = outbound_http::send_request(
        builder.body(
            request
                .body
                .map(|bytes| Bytes::copy_from_slice(bytes.as_bytes())),
        )?,
    )?;

    let response = OutboundResponse {
        status: response.status().as_u16(),
        headers: response
            .headers()
            .iter()
            .map(|(key, value)| (key.as_str(), String::from_utf8_lossy(value.as_bytes())))
            .collect(),
        body: response
            .body()
            .as_ref()
            .map(|bytes| String::from_utf8_lossy(bytes.deref())),
    };

    let mut serializer = Serializer::from_context(context)?;
    response.serialize(&mut serializer)?;
    Ok(serializer.value)
}

unsafe fn spin_send_http_request(
    ctx: *mut JSContext,
    _this: JSValue,
    argc: c_int,
    argv: *mut JSValue,
    _magic: c_int,
) -> JSValue {
    if argc == 1 {
        match send_http_request(&Context::from_raw(ctx), Value::from_raw(ctx, *argv)) {
            Ok(response) => response.to_raw(),
            Err(e) => {
                eprintln!("{e:?}");
                ext_js_exception
            }
        }
    } else {
        ext_js_exception
    }
}

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

    let config = context.object_value().unwrap();
    config
        .set_property(
            "get",
            unsafe {
                context.new_callback(|ctx, this, argc, argv, magic| {
                    spin_get_config(ctx, this, argc, argv, magic)
                })
            }
            .unwrap(),
        )
        .unwrap();
    let http = context.object_value().unwrap();
    http.set_property(
        "send",
        unsafe {
            context.new_callback(|ctx, this, argc, argv, magic| {
                spin_send_http_request(ctx, this, argc, argv, magic)
            })
        }
        .unwrap(),
    )
    .unwrap();
    let spin = context.object_value().unwrap();
    spin.set_property("config", config).unwrap();
    spin.set_property("http", http).unwrap();
    global.set_property("spin", spin).unwrap();

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

    let request = InboundRequest {
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

    let response = InboundResponse::deserialize(&mut Deserializer::from(response))?;
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
