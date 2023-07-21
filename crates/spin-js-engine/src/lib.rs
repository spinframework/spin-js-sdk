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
        http_component, key_value,
        key_value::Store,
        outbound_http, pg,
        redis::{self, RedisResult},
        sqlite,
    },
    std::{
        collections::HashMap,
        env, fs,
        io::{self, Read},
        mem,
        ops::{Deref, DerefMut},
        path::PathBuf,
        rc::Rc,
        str,
        sync::Mutex,
    },
    subtle::ConstantTimeEq,
};

#[export_name = "spin-sdk-language-javascript"]
extern "C" fn __spin_sdk_language() {}

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

fn redis_exec(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    enum Parameter {
        Int64(i64),
        Binary(ByteBuf),
    }

    match args {
        [address, command, arguments] => {
            let address = &deserialize_helper(address)?;
            let command = &deserialize_helper(command)?;
            let mut arg = vec![];
            if arguments.is_array() {
                let mut props = arguments.properties()?;
                while let Some(ref _x) = props.next_key()? {
                    let val = props.next_value()?;
                    if val.is_big_int() {
                        let deserializer = &mut Deserializer::from(val.clone());
                        let temp = i64::deserialize(deserializer)?;
                        arg.push(Parameter::Int64(temp));
                    } else if val.is_array_buffer() {
                        let deserializer = &mut Deserializer::from(val.clone());
                        let temp = ByteBuf::deserialize(deserializer)?;
                        arg.push(Parameter::Binary(temp));
                    } else {
                        bail!("invalid argument type, must be bigint or arraybuffer")
                    }
                }
            } else {
                bail!("invalid argument type, must be array")
            }
            let results = redis::execute(
                address,
                command,
                &arg.iter()
                    .map(|arg| match arg {
                        Parameter::Int64(v) => redis::RedisParameter::Int64(*v),
                        Parameter::Binary(v) => redis::RedisParameter::Binary(v.deref()),
                    })
                    .collect::<Vec<_>>(),
            )
            .map_err(|_| anyhow!("Error executing Redis execute command"))?;
            let arr = context.array_value()?;
            for result in results.iter() {
                match result {
                    RedisResult::Nil => arr.append_property(context.undefined_value()?)?,
                    RedisResult::Status(val) => {
                        arr.append_property(context.value_from_str(val)?)?
                    }
                    RedisResult::Int64(val) => {
                        arr.append_property(context.value_from_i64(val.to_owned())?)?
                    }
                    RedisResult::Binary(val) => {
                        let mut serializer = Serializer::from_context(context)?;
                        val.serialize(&mut serializer)?;
                        arr.append_property(serializer.value)?;
                    }
                }
            }
            Ok(arr)
        }
        _ => bail!(
            "expected a three arguments (address, command, arguments), got {} arguments",
            args.len()
        ),
    }
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

fn timing_safe_equals(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args {
        [value1, value2] => {
            let value1_deserializer = &mut Deserializer::from(value1.clone());
            let value1 = ByteBuf::deserialize(value1_deserializer)?;
            let value2_deserializer = &mut Deserializer::from(value2.clone());
            let value2 = ByteBuf::deserialize(value2_deserializer)?;
            context.value_from_bool(bool::from(value1.ct_eq(&value2)))
        }
        _ => bail!(
            "expected a two arguments (value1, value2), got {} arguments",
            args.len()
        ),
    }
}

fn open_kv(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args.len() {
        0 | 1 => {
            let store = Rc::new(match args {
                [name] => {
                    let name = deserialize_helper(name)?;
                    Store::open(name)?
                }
                _ => Store::open_default()?,
            });
            let kv_store = context.object_value()?;

            kv_store.set_property(
                "delete",
                context.wrap_callback({
                    let store = store.clone();
                    move |context, _this: &Value, args: &[Value]| match args {
                        [key] => {
                            let key = deserialize_helper(key)?;
                            store.delete(key)?;
                            context.undefined_value()
                        }
                        _ => bail!("expected one argument (key) got {} arguments", args.len()),
                    }
                })?,
            )?;

            kv_store.set_property(
                "exists",
                context.wrap_callback({
                    let store = store.clone();
                    move |context, _this: &Value, args: &[Value]| match args {
                        [key] => {
                            let key = deserialize_helper(key)?;
                            context.value_from_bool(store.exists(key)?)
                        }
                        _ => bail!("expected one argument (key) got {} arguments", args.len()),
                    }
                })?,
            )?;

            kv_store.set_property(
                "get",
                context.wrap_callback({
                    let store = store.clone();
                    move |context, _this: &Value, args: &[Value]| match args {
                        [key] => {
                            let key = deserialize_helper(key)?;
                            let result = store.get(key);
                            match result {
                                Ok(val) => {
                                    let mut serializer = Serializer::from_context(context)?;
                                    val.serialize(&mut serializer)?;
                                    Ok(serializer.value)
                                }
                                Err(key_value::Error::NoSuchKey) => context.null_value(),
                                Err(e) => Err(e.into()),
                            }
                        }
                        _ => bail!("expected one argument (key) got {} arguments", args.len()),
                    }
                })?,
            )?;

            kv_store.set_property(
                "getKeys",
                context.wrap_callback({
                    let store = store.clone();
                    move |context, _this: &Value, _args: &[Value]| {
                        let value = store.get_keys()?;
                        let mut serializer = Serializer::from_context(context)?;
                        value.serialize(&mut serializer)?;
                        Ok(serializer.value)
                    }
                })?,
            )?;

            kv_store.set_property(
                "set",
                context.wrap_callback({
                    move |context, _this: &Value, args: &[Value]| match args {
                        [key, value] => {
                            let key = deserialize_helper(key)?;
                            let buf;
                            if value.is_str() {
                                buf = deserialize_helper(value)?.into_bytes();
                            } else if value.is_array_buffer() {
                                let deserializer = &mut Deserializer::from(value.clone());
                                buf = ByteBuf::deserialize(deserializer)?.to_vec();
                            } else {
                                bail!("invalid value type, accepted types are strings and arrayBuffers")
                            }
                            store.set(key, buf)?;
                            context.undefined_value()
                        }
                        _ => bail!("expected two arguments (key, value) got {} arguments", args.len()),
                    }
                })?,
            )?;

            Ok(kv_store)
        }
        _ => {
            bail!("expected one argument (name) got {} arguments", args.len())
        }
    }
}

fn open_sqlite(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    let implementation = match args {
        [] => sqlite::Connection::open_default()?,
        [name] => sqlite::Connection::open(&deserialize_helper(name)?)?,
        _ => bail!("expected one argument (name) got {} arguments", args.len()),
    };
    let connection = context.object_value()?;

    connection.set_property(
        "execute",
        context.wrap_callback({
            move |context, _this: &Value, args: &[Value]| {
                let (query, js_parameters) = match args {
                    [js_query] => (deserialize_helper(js_query)?, Vec::new()),
                    [js_query, js_parameters, ..] => {
                        let mut props = js_parameters.properties()?;
                        let mut parameters = Vec::new();
                        while props.next_key()?.is_some() {
                            parameters.push(props.next_value()?);
                        }

                        (deserialize_helper(js_query)?, parameters)
                    }
                    [] => bail!("expected arguments to the `query` function but got none"),
                };
                let parameters = js_parameters
                    .iter()
                    .map(|v| {
                        let p = if v.is_null() {
                            sqlite::ValueParam::Null
                        } else if v.is_repr_as_i32() {
                            let deserializer = &mut Deserializer::from(v.clone());
                            sqlite::ValueParam::Integer(i64::deserialize(deserializer)?)
                        } else if let Ok(s) = v.as_str() {
                            sqlite::ValueParam::Text(s)
                        } else if let Ok(s) = v.as_bytes() {
                            sqlite::ValueParam::Blob(s)
                        } else if let Ok(f) = v.as_f64() {
                            sqlite::ValueParam::Real(f)
                        } else {
                            bail!("invalid argument type for `parameters` argument to `execute` function: {:?}", v)
                        };
                        Ok(p)
                    })
                    .collect::<anyhow::Result<Vec<_>>>()?;
                let result = implementation.execute(&query, &parameters)?;

                let mut serializer = Serializer::from_context(context)?;
                let columns = result.columns;
                columns.serialize(&mut serializer)?;
                let js_columns = serializer.value;

                let js_rows = context.array_value()?;
                for row in result.rows {
                    let js_row = context.array_value()?;
                    for value in row.values {
                        let js_value = match value {
                            sqlite::ValueResult::Null => context.null_value()?,
                            sqlite::ValueResult::Integer(i) => context.value_from_i64(i)?,
                            sqlite::ValueResult::Real(r) => context.value_from_f64(r)?,
                            sqlite::ValueResult::Text(s) => context.value_from_str(&s)?,
                            sqlite::ValueResult::Blob(b) => context.array_buffer_value(&b)?,
                        };
                        js_row.append_property(js_value)?;
                    }
                    js_rows.append_property(js_row)?;
                }

                let result = context.object_value()?;
                result.set_property("columns", js_columns)?;
                result.set_property("rows", js_rows)?;

                Ok(result)
            }
        })?,
    )?;

    Ok(connection)
}

enum RdbmsParameter {
    Boolean(bool),
    Int32(i32),
    Int64(i64),
    Float64(f64),
    Str(String),
    Binary(ByteBuf),
    DbNull,
}

fn rdbms_param_deserializer(params: &Value, arg: &mut Vec<RdbmsParameter>) -> Result<()> {
    let mut props = params.properties()?;
    while let Some(ref _x) = props.next_key()? {
        let val = props.next_value()?;
        if val.is_bool() {
            let deserializer = &mut Deserializer::from(val.clone());
            let temp = bool::deserialize(deserializer)?;
            arg.push(RdbmsParameter::Boolean(temp));
        } else if val.is_repr_as_i32() {
            let deserializer = &mut Deserializer::from(val.clone());
            let temp = i32::deserialize(deserializer)?;
            arg.push(RdbmsParameter::Int32(temp));
        } else if val.is_big_int() {
            let deserializer = &mut Deserializer::from(val.clone());
            let temp = i64::deserialize(deserializer)?;
            arg.push(RdbmsParameter::Int64(temp));
        } else if val.is_repr_as_f64() {
            let deserializer = &mut Deserializer::from(val.clone());
            let temp = f64::deserialize(deserializer)?;
            arg.push(RdbmsParameter::Float64(temp));
        } else if val.is_str() {
            let temp = deserialize_helper(&val)?;
            arg.push(RdbmsParameter::Str(temp))
        } else if val.is_array_buffer() {
            let deserializer = &mut Deserializer::from(val.clone());
            let temp = ByteBuf::deserialize(deserializer)?;
            arg.push(RdbmsParameter::Binary(temp));
        } else if val.is_null_or_undefined() {
            arg.push(RdbmsParameter::DbNull)
        } else {
            bail!("invalid argument type, must be array of stuff")
        }
    }
    Ok(())
}

// Host implementation does not exist in cloud yet

// fn map_rdbms_mysql(arg: &RdbmsParameter) -> mysql::ParameterValue {
//     match arg {
//         RdbmsParameter::Boolean(v) => mysql::ParameterValue::Boolean(*v),
//         RdbmsParameter::Int32(v) => mysql::ParameterValue::Int32(*v),
//         RdbmsParameter::Int64(v) => mysql::ParameterValue::Int64(*v),
//         RdbmsParameter::Float64(v) => mysql::ParameterValue::Floating64(*v),
//         RdbmsParameter::Str(v) => mysql::ParameterValue::Str(v),
//         RdbmsParameter::Binary(v) => mysql::ParameterValue::Binary(v),
//         RdbmsParameter::DbNull => mysql::ParameterValue::DbNull,
//     }
// }

// fn mysql_execute(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
//     match args {
//         [address, statement, params] => {
//             let address = deserialize_helper(address)?;
//             let statement = deserialize_helper(statement)?;
//             let mut arg = vec![];
//             if params.is_array() {
//                 rdbms_param_deserializer(params, &mut arg)?;

//                 mysql::execute(
//                     &address,
//                     &statement,
//                     &arg.iter().map(map_rdbms_mysql).collect::<Vec<_>>(),
//                 )
//                 .map_err(|err| anyhow!("Error executing mysql execute command: {}", err))?;
//                 context.undefined_value()
//             } else {
//                 bail!("invalid argument type, must be array")
//             }
//         }
//         _ => {
//             bail!("expected three arguments (address, statement, list<parameter-value>) got {} arguments", args.len())
//         }
//     }
// }

// fn mysql_query(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
//     match args {
//         [address, statement, params] => {
//             let address = deserialize_helper(address)?;
//             let statement = deserialize_helper(statement)?;
//             let mut arg = vec![];
//             if params.is_array() {
//                 rdbms_param_deserializer(params, &mut arg)?;

//                 let result = mysql::query(
//                     &address,
//                     &statement,
//                     &arg.iter().map(map_rdbms_mysql).collect::<Vec<_>>(),
//                 )
//                 .map_err(|err| anyhow!("Error executing mysql execute command: {}", err))?;

//                 let ret = context.object_value()?;
//                 let cols = context.array_value()?;

//                 for col in result.columns.iter() {
//                     cols.append_property(context.value_from_str(&col.name)?)?;
//                 }

//                 let rows = context.array_value()?;

//                 for row in result.rows.iter() {
//                     let temp = context.array_value()?;
//                     for val in row {
//                         let js_val = match val {
//                             mysql::DbValue::Boolean(v) => context.value_from_bool(*v)?,
//                             mysql::DbValue::Int8(v) => {
//                                 context.value_from_i32(v.to_owned().into())?
//                             }
//                             mysql::DbValue::Int16(v) => {
//                                 context.value_from_i32(v.to_owned().into())?
//                             }
//                             mysql::DbValue::Int32(v) => context.value_from_i32(*v)?,
//                             mysql::DbValue::Int64(v) => context.value_from_i64(*v)?,
//                             mysql::DbValue::Uint8(v) => {
//                                 context.value_from_u32(v.to_owned().into())?
//                             }
//                             mysql::DbValue::Uint16(v) => {
//                                 context.value_from_u32(v.to_owned().into())?
//                             }
//                             mysql::DbValue::Uint32(v) => context.value_from_u32(*v)?,
//                             mysql::DbValue::Uint64(v) => context.value_from_u64(*v)?,
//                             mysql::DbValue::Floating32(v) => {
//                                 context.value_from_f64(v.to_owned().into())?
//                             }
//                             mysql::DbValue::Floating64(v) => context.value_from_f64(*v)?,
//                             mysql::DbValue::Str(v) => context.value_from_str(v)?,
//                             mysql::DbValue::Binary(v) => context.array_buffer_value(v)?,
//                             mysql::DbValue::DbNull => context.null_value()?,
//                             mysql::DbValue::Unsupported => {
//                                 bail!("Unsupported value found in pg query")
//                             }
//                         };
//                         temp.append_property(js_val)?;
//                     }
//                     rows.append_property(temp)?;
//                 }

//                 ret.set_property("columns", cols)?;
//                 ret.set_property("rows", rows)?;

//                 Ok(ret)
//             } else {
//                 bail!("invalid argument type, must be array")
//             }
//         }
//         _ => {
//             bail!("expected three arguments (address, statement, list<parameter-value>) got {} arguments", args.len())
//         }
//     }
// }

fn map_rdbms_pg(arg: &RdbmsParameter) -> pg::ParameterValue {
    match arg {
        RdbmsParameter::Boolean(v) => pg::ParameterValue::Boolean(*v),
        RdbmsParameter::Int32(v) => pg::ParameterValue::Int32(*v),
        RdbmsParameter::Int64(v) => pg::ParameterValue::Int64(*v),
        RdbmsParameter::Float64(v) => pg::ParameterValue::Floating64(*v),
        RdbmsParameter::Str(v) => pg::ParameterValue::Str(v),
        RdbmsParameter::Binary(v) => pg::ParameterValue::Binary(v),
        RdbmsParameter::DbNull => pg::ParameterValue::DbNull,
    }
}

fn postgres_execute(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args {
        [address, statement, params] => {
            let address = deserialize_helper(address)?;
            let statement = deserialize_helper(statement)?;
            let mut arg = vec![];
            if params.is_array() {
                rdbms_param_deserializer(params, &mut arg)?;

                pg::execute(
                    &address,
                    &statement,
                    &arg.iter().map(map_rdbms_pg).collect::<Vec<_>>(),
                )
                .map_err(|err| anyhow!("Error executing postgres execute command: {}", err))?;
                context.undefined_value()
            } else {
                bail!("invalid argument type, must be array")
            }
        }
        _ => {
            bail!("expected three arguments (address, statement, list<parameter-value>) got {} arguments", args.len())
        }
    }
}

fn postgres_query(context: &Context, _this: &Value, args: &[Value]) -> Result<Value> {
    match args {
        [address, statement, params] => {
            let address = deserialize_helper(address)?;
            let statement = deserialize_helper(statement)?;
            let mut arg = vec![];
            if params.is_array() {
                rdbms_param_deserializer(params, &mut arg)?;

                let result = pg::query(
                    &address,
                    &statement,
                    &arg.iter().map(map_rdbms_pg).collect::<Vec<_>>(),
                )
                .map_err(|err| anyhow!("Error executing mysql execute command: {}", err))?;

                let ret = context.object_value()?;
                let cols = context.array_value()?;

                for col in result.columns.iter() {
                    cols.append_property(context.value_from_str(&col.name)?)?;
                }

                let rows = context.array_value()?;

                for row in result.rows.iter() {
                    let temp = context.array_value()?;
                    for val in row {
                        let js_val = match val {
                            pg::DbValue::Boolean(v) => context.value_from_bool(*v)?,
                            pg::DbValue::Int8(v) => context.value_from_i32(v.to_owned().into())?,
                            pg::DbValue::Int16(v) => context.value_from_i32(v.to_owned().into())?,
                            pg::DbValue::Int32(v) => context.value_from_i32(*v)?,
                            pg::DbValue::Int64(v) => context.value_from_i64(*v)?,
                            pg::DbValue::Uint8(v) => context.value_from_u32(v.to_owned().into())?,
                            pg::DbValue::Uint16(v) => {
                                context.value_from_u32(v.to_owned().into())?
                            }
                            pg::DbValue::Uint32(v) => context.value_from_u32(*v)?,
                            pg::DbValue::Uint64(v) => context.value_from_u64(*v)?,
                            pg::DbValue::Floating32(v) => {
                                context.value_from_f64(v.to_owned().into())?
                            }
                            pg::DbValue::Floating64(v) => context.value_from_f64(*v)?,
                            pg::DbValue::Str(v) => context.value_from_str(v)?,
                            pg::DbValue::Binary(v) => context.array_buffer_value(v)?,
                            pg::DbValue::DbNull => context.null_value()?,
                            pg::DbValue::Unsupported => {
                                bail!("Unsupported value found in pg query")
                            }
                        };
                        temp.append_property(js_val)?;
                    }
                    rows.append_property(temp)?;
                }

                ret.set_property("columns", cols)?;
                ret.set_property("rows", rows)?;

                Ok(ret)
            } else {
                bail!("invalid argument type, must be array")
            }
        }
        _ => {
            bail!("expected three arguments (address, statement, list<parameter-value>) got {} arguments", args.len())
        }
    }
}

fn do_init() -> Result<()> {
    let mut script = String::new();
    io::stdin().read_to_string(&mut script)?;

    let context = Context::default();
    let global = context.global_object()?;

    let console = context.object_value()?;
    console.set_property("log", context.wrap_callback(console_log)?)?;

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
    redis.set_property("execute", context.wrap_callback(redis_exec)?)?;

    // let mysql = context.object_value()?;
    // mysql.set_property("execute", context.wrap_callback(mysql_execute)?)?;
    // mysql.set_property("query", context.wrap_callback(mysql_query)?)?;

    let postgres = context.object_value()?;
    postgres.set_property("execute", context.wrap_callback(postgres_execute)?)?;
    postgres.set_property("query", context.wrap_callback(postgres_query)?)?;

    let kv = context.object_value()?;
    kv.set_property("open", context.wrap_callback(open_kv)?)?;
    kv.set_property("openDefault", context.wrap_callback(open_kv)?)?;

    let sqlite = context.object_value()?;
    sqlite.set_property("open", context.wrap_callback(open_sqlite)?)?;
    sqlite.set_property("openDefault", context.wrap_callback(open_sqlite)?)?;

    let spin_sdk = context.object_value()?;
    spin_sdk.set_property("config", config)?;
    spin_sdk.set_property("http", http)?;
    spin_sdk.set_property("redis", redis)?;
    // spin_sdk.set_property("mysql", mysql)?;
    spin_sdk.set_property("pg", postgres)?;
    spin_sdk.set_property("kv", kv)?;
    spin_sdk.set_property("sqlite", sqlite)?;

    let _glob = context.object_value()?;
    _glob.set_property("get", context.wrap_callback(get_glob)?)?;

    let _random = context.object_value()?;
    _random.set_property("math_rand", context.wrap_callback(math_rand)?)?;
    _random.set_property("get_rand", context.wrap_callback(get_rand)?)?;
    _random.set_property("get_hash", context.wrap_callback(get_hash)?)?;
    _random.set_property("get_hmac", context.wrap_callback(get_hmac)?)?;
    _random.set_property(
        "timing_safe_equals",
        context.wrap_callback(timing_safe_equals)?,
    )?;

    let internal_implementations = context.object_value()?;
    internal_implementations.set_property("spin_sdk", spin_sdk)?;
    internal_implementations.set_property("console", console)?;

    global.set_property("_random", _random)?;
    global.set_property("__internal__", internal_implementations)?;
    global.set_property("_fsPromises", fs_promises)?;
    global.set_property("_glob", _glob)?;

    global.set_property("setTimeout", context.wrap_callback(set_timeout)?)?;
    context.eval_global("sdk.js", include_str!("../sdk.js"))?;

    context.eval_global("script.js", &script)?;

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
        _ => bail!("failed to deserialize value '{value:?}' as string"),
    }
}
