#![deny(warnings)]

use {
    anyhow::{anyhow, bail, Result},
    hmac::{Hmac, Mac},
    http::{header::HeaderName, request, HeaderValue},
    once_cell::sync::{Lazy, OnceCell},
    quickjs_wasm_rs::{Context, Deserializer, Exception, Serializer, Value},
    rand::{thread_rng, Rng},
    send_wrapper::SendWrapper,
    serde::{Deserialize, Serialize},
    serde_bytes::ByteBuf,
    sha2::{Digest, Sha256, Sha512},
    spin_sdk::{
        config,
        http::{Request, Response},
        http_component, outbound_http, redis,
    },
    std::{
        collections::HashMap,
        env, fs,
        io::{self, Read},
        mem,
        ops::{Deref, DerefMut},
        path::PathBuf,
        str,
        sync::Mutex,
    },
};

static CONTEXT: OnceCell<SendWrapper<Context>> = OnceCell::new();
static GLOBAL: OnceCell<SendWrapper<Value>> = OnceCell::new();
static ENTRYPOINT: OnceCell<SendWrapper<Value>> = OnceCell::new();
static ON_RESOLVE: OnceCell<SendWrapper<Value>> = OnceCell::new();
static ON_REJECT: OnceCell<SendWrapper<Value>> = OnceCell::new();
static RESPONSE: Lazy<Mutex<Option<Result<SendWrapper<Value>>>>> = Lazy::new(|| Mutex::new(None));
static TASKS: Lazy<Mutex<Vec<SendWrapper<Value>>>> = Lazy::new(|| Mutex::new(Vec::new()));

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
            *RESPONSE.lock().unwrap() = Some(Ok(SendWrapper::new(response.clone())));

            context.undefined_value()
        }

        _ => Err(anyhow!("expected 1 argument, got {}", args.len())),
    }
}

fn on_reject(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args {
        [error] => {
            *RESPONSE.lock().unwrap() = Some(Err(Exception::from(error.clone())?.into_error()));

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
                let e = e?;
                let file_type = e.file_type()?;
                let entry = context.object_value()?;
                entry.set_property(
                    "name",
                    context.value_from_str(&e.file_name().to_string_lossy())?,
                )?;
                entry.set_property(
                    "isFile",
                    context.wrap_callback({
                        move |context, _, _| context.value_from_bool(file_type.is_file())
                    })?,
                )?;

                entry.set_property(
                    "isDirectory",
                    context.wrap_callback({
                        move |context, _, _| context.value_from_bool(file_type.is_dir())
                    })?,
                )?;

                entry.set_property(
                    "isSymbolicLink",
                    context.wrap_callback({
                        move |context, _, _| context.value_from_bool(file_type.is_symlink())
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
    context.value_from_u32(thread_rng().gen_range(0..=255))
}

fn get_hash(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args {
        [algorithm, content] => {
            let algorithm = &deserialize_helper(algorithm)?;
            let content_deserializer = &mut Deserializer::from(content.clone());
            let content = ByteBuf::deserialize(content_deserializer)?;
            if algorithm == "sha256" {
                let hashvalue = sha2::Sha256::digest(content);
                let mut serializer = Serializer::from_context(context)?;
                hashvalue.serialize(&mut serializer)?;
                Ok(serializer.value)
            } else if algorithm == "sha512" {
                let hashvalue = sha2::Sha512::digest(content);
                let mut serializer = Serializer::from_context(context)?;
                hashvalue.serialize(&mut serializer)?;
                Ok(serializer.value)
            } else {
                bail!("Invalid algorithm, only sha256 and sha512 are supported")
            }
        }
        _ => bail!("invalid"),
    }
}

fn get_hmac(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args {
        [algorithm, key, content] => {
            let algorithm = &deserialize_helper(algorithm)?;
            let key_deserializer = &mut Deserializer::from(key.clone());
            let key = ByteBuf::deserialize(key_deserializer)?;
            let content_deserializer = &mut Deserializer::from(content.clone());
            let content = ByteBuf::deserialize(content_deserializer)?;

            if algorithm == "sha256" {
                let mut mac =
                    Hmac::<Sha256>::new_from_slice(&key).expect("HMAC can take key of any size");
                mac.update(&content);
                let result = mac.finalize();
                let code_bytes = result.into_bytes();
                let mut serializer = Serializer::from_context(context)?;
                code_bytes.serialize(&mut serializer)?;
                Ok(serializer.value)
            } else if algorithm == "sha512" {
                let mut mac =
                    Hmac::<Sha512>::new_from_slice(&key).expect("HMAC can take key of any size");
                mac.update(&content);
                let result = mac.finalize();
                let code_bytes = result.into_bytes();
                let mut serializer = Serializer::from_context(context)?;
                code_bytes.serialize(&mut serializer)?;
                Ok(serializer.value)
            } else {
                bail!("Invalid algorithm, only sha256 and sha512 are supported")
            }
        }
        _ => {
            bail!(
                "expected a three arguments (algorithm, key, content), got {} arguments",
                args.len()
            )
        }
    }
}

fn math_rand(context: &Context, _this: &Value, _args: &[Value]) -> Result<Value> {
    context.value_from_f64(thread_rng().gen_range(0.0_f64..1.0))
}

fn redis_get(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args {
        [address, key] => {
            let address = &deserialize_helper(address)?;
            let key = &deserialize_helper(key)?;
            let buffer = redis::get(address, key)
                .map_err(|_| anyhow!("Error executing Redis get command"))?;
            let mut serializer = Serializer::from_context(context)?;
            buffer.serialize(&mut serializer)?;
            Ok(serializer.value)
        }
        _ => bail!(
            "expected a two arguments (address, key), got {} arguments",
            args.len()
        ),
    }
}
fn redis_incr(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args {
        [address, key] => {
            let address = &deserialize_helper(address)?;
            let key = &deserialize_helper(key)?;
            let value = redis::incr(address, key)
                .map_err(|_| anyhow!("Error executing Redis incr command"))?;
            let mut serializer = Serializer::from_context(context)?;
            value.serialize(&mut serializer)?;
            Ok(serializer.value)
        }
        _ => bail!(
            "expected a two arguments (address, key), got {} arguments",
            args.len()
        ),
    }
}

fn redis_del(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args {
        [address, key] => {
            let address = &deserialize_helper(address)?;
            let deserializer = &mut Deserializer::from(key.clone());
            let key = Vec::<String>::deserialize(deserializer)?;
            let keys = key.iter().map(|s| s.as_str()).collect::<Vec<_>>();
            let value = redis::del(address, keys.as_slice())
                .map_err(|_| anyhow!("Error executing Redis del command"))?;
            let mut serializer = Serializer::from_context(context)?;
            value.serialize(&mut serializer)?;
            Ok(serializer.value)
        }
        _ => bail!(
            "expected a two arguments (address, [keys]), got {} arguments",
            args.len()
        ),
    }
}

fn redis_set(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args {
        [address, key, value] => {
            let address = &deserialize_helper(address)?;
            let key = &deserialize_helper(key)?;
            let value_deserializer = &mut Deserializer::from(value.clone());
            let value = ByteBuf::deserialize(value_deserializer)?;
            redis::set(address, key, &value)
                .map_err(|_| anyhow!("Error executing Redis set command"))?;
            context.undefined_value()
        }
        _ => bail!(
            "expected a three arguments (address, key, value), got {} arguments",
            args.len()
        ),
    }
}

fn redis_sadd(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args {
        [address, key, values] => {
            let address = &deserialize_helper(address)?;
            let key = &deserialize_helper(key)?;
            let deserializer = &mut Deserializer::from(values.clone());
            let value_array = Vec::<String>::deserialize(deserializer)?;
            let values = value_array.iter().map(|s| s.as_str()).collect::<Vec<_>>();
            let value = redis::sadd(address, key, values.as_slice())
                .map_err(|_| anyhow!("Error executing Redis sadd command"))?;
            let mut serializer = Serializer::from_context(context)?;
            value.serialize(&mut serializer)?;
            Ok(serializer.value)
        }
        _ => bail!(
            "expected a two arguments (address, key, [values..]), got {} arguments",
            args.len()
        ),
    }
}

fn redis_smembers(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args {
        [address, key] => {
            let address = &deserialize_helper(address)?;
            let key = &deserialize_helper(key)?;
            let value = redis::smembers(address, key)
                .map_err(|_| anyhow!("Error executing Redis smembers command"))?;
            let mut serializer = Serializer::from_context(context)?;
            value.serialize(&mut serializer)?;
            Ok(serializer.value)
        }
        _ => bail!(
            "expected a two arguments (address, key), got {} arguments",
            args.len()
        ),
    }
}

fn redis_srem(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args {
        [address, key, values] => {
            let address = &deserialize_helper(address)?;
            let key = &deserialize_helper(key)?;
            let deserializer = &mut Deserializer::from(values.clone());
            let value_array = Vec::<String>::deserialize(deserializer)?;
            let values = value_array.iter().map(|s| s.as_str()).collect::<Vec<_>>();
            let value = redis::srem(address, key, values.as_slice())
                .map_err(|_| anyhow!("Error executing Redis sadd command"))?;
            let mut serializer = Serializer::from_context(context)?;
            value.serialize(&mut serializer)?;
            Ok(serializer.value)
        }
        _ => bail!(
            "expected a two arguments (address, key, [values..]), got {} arguments",
            args.len()
        ),
    }
}

fn redis_publish(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args {
        [address, channel, value] => {
            let address = &deserialize_helper(address)?;
            let channel = &deserialize_helper(channel)?;
            let value_deserializer = &mut Deserializer::from(value.clone());
            let value = ByteBuf::deserialize(value_deserializer)?;
            redis::publish(address, channel, &value)
                .map_err(|_| anyhow!("Error executing Redis publish command"))?;
            context.undefined_value()
        }
        _ => bail!(
            "expected a three arguments (address, key, value), got {} arguments",
            args.len()
        ),
    }
}

fn set_timeout(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args {
        [function] => {
            TASKS
                .lock()
                .unwrap()
                .push(SendWrapper::new(function.clone()));

            // TODO: If we ever add support for `clearTimeout`, we'll need to produce a unique ID here:
            context.value_from_u32(0)
        }
        _ => bail!(
            "expected one argument (function), got {} arguments",
            args.len()
        ),
    }
}

fn do_init() -> Result<()> {
    let mut script = String::new();
    io::stdin().read_to_string(&mut script)?;

    let context = Context::default();
    context.eval_global("sdk.js", include_str!("../sdk.js"))?;
    context.eval_global("script.js", &script)?;

    let global = context.global_object()?;

    let entrypoint;
    if global
        .get_property("spin")?
        .get_property("handler")?
        .is_function()
    {
        // handler(req, res) signature exists
        entrypoint = global
            .get_property("spinInternal")?
            .get_property("_handler")?;
    } else if global
        .get_property("spin")?
        .get_property("handleRequest")?
        .is_function()
    {
        // Fall back to handler(req) signature
        entrypoint = global
            .get_property("spinInternal")?
            .get_property("_handleRequest")?;
    } else {
        panic!("expected function named \"handleRequest\" or \"handler\"  in \"spin\"")
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

    let redis = context.object_value()?;
    redis.set_property("get", context.wrap_callback(redis_get)?)?;
    redis.set_property("set", context.wrap_callback(redis_set)?)?;
    redis.set_property("incr", context.wrap_callback(redis_incr)?)?;
    redis.set_property("publish", context.wrap_callback(redis_publish)?)?;
    redis.set_property("del", context.wrap_callback(redis_del)?)?;
    redis.set_property("sadd", context.wrap_callback(redis_sadd)?)?;
    redis.set_property("smembers", context.wrap_callback(redis_smembers)?)?;
    redis.set_property("srem", context.wrap_callback(redis_srem)?)?;

    let spin_sdk = context.object_value()?;
    spin_sdk.set_property("config", config)?;
    spin_sdk.set_property("http", http)?;
    spin_sdk.set_property("redis", redis)?;

    let _glob = context.object_value()?;
    _glob.set_property("get", context.wrap_callback(get_glob)?)?;

    let _random = context.object_value()?;
    _random.set_property("math_rand", context.wrap_callback(math_rand)?)?;
    _random.set_property("get_rand", context.wrap_callback(get_rand)?)?;
    _random.set_property("get_hash", context.wrap_callback(get_hash)?)?;
    _random.set_property("get_hmac", context.wrap_callback(get_hmac)?)?;

    global.set_property("_random", _random)?;
    global.set_property("spinSdk", spin_sdk)?;
    global.set_property("_fsPromises", fs_promises)?;
    global.set_property("_glob", _glob)?;

    global.set_property("setTimeout", context.wrap_callback(set_timeout)?)?;

    let on_resolve = context.wrap_callback(on_resolve)?;
    let on_reject = context.wrap_callback(on_reject)?;

    CONTEXT.set(SendWrapper::new(context)).unwrap();
    GLOBAL.set(SendWrapper::new(global)).unwrap();
    ENTRYPOINT.set(SendWrapper::new(entrypoint)).unwrap();
    ON_RESOLVE.set(SendWrapper::new(on_resolve)).unwrap();
    ON_REJECT.set(SendWrapper::new(on_reject)).unwrap();

    Ok(())
}

#[export_name = "wizer.initialize"]
pub extern "C" fn init() {
    do_init().unwrap()
}

#[http_component]
fn handle(request: Request) -> Result<Response> {
    let context = CONTEXT.get().unwrap();
    let global = GLOBAL.get().unwrap();
    let entrypoint = ENTRYPOINT.get().unwrap();
    let on_resolve = ON_RESOLVE.get().unwrap();
    let on_reject = ON_REJECT.get().unwrap();

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
            .map(|(k, v)| {
                Ok((
                    k.as_str().to_owned(),
                    str::from_utf8(v.as_bytes())?.to_owned(),
                ))
            })
            .collect::<Result<_>>()?,
        body: request
            .into_body()
            .map(|bytes| ByteBuf::from(bytes.deref())),
    };
    let mut serializer = Serializer::from_context(context)?;
    request.serialize(&mut serializer)?;
    let request_value = serializer.value;
    let body = request.body;

    request_value.set_property(
        "text",
        context.wrap_callback({
            let body = body.clone();
            move |context, _, _| match &body {
                Some(body) => context.value_from_str(str::from_utf8(body)?),
                _ => context.value_from_str(""),
            }
        })?,
    )?;

    request_value.set_property(
        "json",
        context.wrap_callback(move |context, _, _| {
            if let Some(body) = &body {
                let mut serializer = Serializer::from_context(context)?;
                serde_json::from_slice::<serde_json::Value>(body)?.serialize(&mut serializer)?;
                Ok(serializer.value)
            } else {
                context.object_value()
            }
        })?,
    )?;

    let promise = entrypoint.call(global, &[request_value])?;

    promise.get_property("then")?.call(
        &promise,
        &[on_resolve.deref().clone(), on_reject.deref().clone()],
    )?;

    context.execute_pending()?;

    // Execute pending `setTimeout` tasks repeatedly until none remain:
    loop {
        let tasks = mem::take(TASKS.lock().unwrap().deref_mut());

        if tasks.is_empty() {
            break;
        } else {
            for task in tasks {
                task.call(global, &[])?;
            }
        }
    }

    let response = RESPONSE.lock().unwrap().take().unwrap()?.take();

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

    Ok(builder.body(response.body.map(|buffer| buffer.to_vec().into()))?)
}

fn deserialize_helper(value: &Value) -> Result<String> {
    let deserializer = &mut Deserializer::from(value.clone());
    let result = String::deserialize(deserializer);
    match result {
        Ok(value) => Ok(value),
        _ => bail!("failed to deserialize string"),
    }
}
