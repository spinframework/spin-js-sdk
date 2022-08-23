use {
    anyhow::Result,
    bytes::Bytes,
    http::{header::HeaderName, HeaderValue},
    once_cell::sync::OnceCell,
    quickjs_wasm_rs::{Context, Deserializer, Serializer, Value},
    quickjs_wasm_sys::{
        ext_js_exception, JSContext, JSValue, JS_FreeCString, JS_NewStringLen, JS_ToCStringLen2,
    },
    serde::{Deserialize, Serialize},
    spin_sdk::{
        config,
        http::{Request, Response},
        http_component,
    },
    std::{
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
        .ok()
        .and_then(|key| config::get(key).ok());

        JS_FreeCString(ctx, key_ptr);

        if let Some(value) = value {
            JS_NewStringLen(ctx, value.as_ptr() as _, value.len() as _)
        } else {
            ext_js_exception
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
    let spin = context.object_value().unwrap();
    spin.set_property("config", config).unwrap();
    global.set_property("spin", spin).unwrap();

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
