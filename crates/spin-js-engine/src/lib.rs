#![deny(warnings)]

use anyhow::bail;
use rand::{thread_rng, Rng};
use std::path::PathBuf;
use std::rc::Rc;

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
        env, fs,
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
    headers: Vec<(String, String)>,
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

fn read_file(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args {
        [filename] => {
            let deserializer = &mut Deserializer::from(filename.clone());
            let filename = PathBuf::deserialize(deserializer)?;
            let buffer = fs::read(filename)?;
            let mut serializer = Serializer::from_context(context)?;
            buffer.serialize(&mut serializer)?;
            Ok(serializer.value)
        }
        _ => Err(anyhow!(
            "expected a single file name argument to read_file, got {} arguments",
            args.len()
        )),
    }
}
#[derive(Serialize, Deserialize, Debug)]
struct ReadDirOptions {
    with_file_types: Option<bool>,
}

fn read_dir(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    let read_file_types: bool;
    let num_args = args.len();
    if num_args == 1 {
        read_file_types = false;
    } else if num_args == 2 {
        let options_deserializer = &mut Deserializer::from(args[1].clone());
        match (ReadDirOptions::deserialize(options_deserializer)?).with_file_types {
            Some(true) => read_file_types = true,
            _ => read_file_types = false,
        }
    } else {
        bail!(
            "expected a 1 or 2 arguments to read_dir, got {} arguments",
            args.len()
        );
    }
    let deserializer = &mut Deserializer::from(args[0].clone());
    let dirname = PathBuf::deserialize(deserializer)?;
    let dir = fs::read_dir(dirname)?;
    match read_file_types {
        true => {
            let array = context.array_value()?;
            for e in dir {
                let e = Rc::new(e?);
                let entry = context.object_value()?;
                entry.set_property(
                    "name",
                    context.value_from_str(&e.file_name().to_string_lossy())?,
                )?;
                entry.set_property(
                    "isFile",
                    context.wrap_callback({
                        let e = e.clone();
                        move |context, _, _| context.value_from_bool(e.file_type()?.is_file())
                    })?,
                )?;

                entry.set_property(
                    "isDirectory",
                    context.wrap_callback({
                        let e = e.clone();
                        move |context, _, _| context.value_from_bool(e.file_type()?.is_dir())
                    })?,
                )?;

                entry.set_property(
                    "isSymbolicLink",
                    context.wrap_callback({
                        move |context, _, _| context.value_from_bool(e.file_type()?.is_symlink())
                    })?,
                )?;

                array.append_property(entry)?;
            }
            Ok(array)
        }
        false => {
            let array = context.array_value()?;
            for e in dir {
                let name = context.value_from_str(&e?.file_name().to_string_lossy())?;
                array.append_property(name)?;
            }
            Ok(array)
        }
    }
}

fn get_glob(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args {
        [globstring] => {
            let array = context.array_value()?;
            let deserializer = &mut Deserializer::from(globstring.clone());
            let globstring = &String::deserialize(deserializer)?;
            let paths = glob::glob(globstring)?;
            for path in paths {
                array.append_property(context.value_from_str(&path?.to_string_lossy())?)?;
            }
            Ok(array)
        }
        _ => bail!(
            "expected a single file name argument to read_file, got {} arguments",
            args.len()
        ),
    }
}

fn get_rand(context: &Context, _this: &Value, _args: &[Value]) -> Result<Value> {
    return context.value_from_u32(thread_rng().gen_range(0..=255));
}

fn math_rand(context: &Context, _this: &Value, _args: &[Value]) -> Result<Value> {
    return context.value_from_f64(thread_rng().gen_range(0.0_f64..1.0));
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

    let fs_promises = context.object_value()?;
    fs_promises.set_property("readFile", context.wrap_callback(read_file)?)?;
    fs_promises.set_property("readDir", context.wrap_callback(read_dir)?)?;

    let spin_sdk = context.object_value()?;
    spin_sdk.set_property("config", config)?;
    spin_sdk.set_property("http", http)?;

    let _glob = context.object_value()?;
    _glob.set_property("get", context.wrap_callback(get_glob)?)?;

    let _random = context.object_value()?;
    _random.set_property("math_rand", context.wrap_callback(math_rand)?)?;
    _random.set_property("get_rand", context.wrap_callback(get_rand)?)?;

    global.set_property("_random", _random)?;
    global.set_property("spinSdk", spin_sdk)?;
    global.set_property("_fsPromises", fs_promises)?;
    global.set_property("_glob", _glob)?;

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

    let env = context.object_value()?;
    for (key, value) in env::vars() {
        env.set_property(key, context.value_from_str(&value)?)?;
    }

    let process = context.object_value()?;
    process.set_property("env", env)?;

    global.set_property("process", process)?;

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
