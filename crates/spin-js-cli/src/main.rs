#![deny(warnings)]

use {
    anyhow::{bail, Context, Result},
    binaryen::{CodegenConfig, Module},
    quickjs_wasm_sys::{
        JSContext, JSValue, JS_Eval, JS_FreeCString, JS_GetException, JS_GetPropertyStr,
        JS_IsError, JS_NewContext, JS_NewRuntime, JS_ToCStringLen2, JS_WriteObject,
        JS_EVAL_FLAG_COMPILE_ONLY, JS_EVAL_TYPE_GLOBAL, JS_TAG_EXCEPTION, JS_TAG_UNDEFINED,
        JS_WRITE_OBJ_BYTECODE,
    },
    std::{
        env,
        ffi::{CStr, CString},
        fmt::Write as _,
        fs,
        io::{Seek as _, SeekFrom, Write as _},
        path::PathBuf,
        process::Command,
        ptr, slice,
    },
    structopt::StructOpt,
    wizer::Wizer,
};

#[allow(non_snake_case)]
fn JS_IsException(value: JSValue) -> bool {
    value.tag as i32 == JS_TAG_EXCEPTION
}

#[allow(non_snake_case)]
fn JS_IsUndefined(value: JSValue) -> bool {
    value.tag as i32 == JS_TAG_UNDEFINED
}

#[derive(Debug, StructOpt)]
#[structopt(name = "spin-js-cli", about = "JavaScript to Spin module utility")]
pub struct Options {
    #[structopt(parse(from_os_str))]
    pub input: PathBuf,

    #[structopt(short = "o", parse(from_os_str), default_value = "index.wasm")]
    pub output: PathBuf,
}

unsafe fn exception_to_string(ctx: *mut JSContext) -> String {
    let mut buffer = String::new();
    let exception = JS_GetException(ctx);
    let c_string = JS_ToCStringLen2(ctx, ptr::null_mut(), exception, 0);
    if c_string.is_null() {
        buffer.push_str("[exception]\n");
    } else {
        writeln!(
            &mut buffer,
            "{}",
            String::from_utf8_lossy(CStr::from_ptr(c_string).to_bytes())
        )
        .unwrap();
        JS_FreeCString(ctx, c_string);
    }
    if JS_IsError(ctx, exception) != 0 {
        let stack = CString::new("stack").unwrap();
        let stack = JS_GetPropertyStr(ctx, exception, stack.as_ptr());
        if !JS_IsUndefined(stack) {
            let c_string = JS_ToCStringLen2(ctx, ptr::null_mut(), exception, 0);
            if !c_string.is_null() {
                writeln!(
                    &mut buffer,
                    "{}",
                    String::from_utf8_lossy(CStr::from_ptr(c_string).to_bytes())
                )
                .unwrap();
                JS_FreeCString(ctx, c_string);
            }
        }
    }

    buffer
}

fn main() -> Result<()> {
    let opts = Options::from_args();

    if env::var("SPIN_JS_WIZEN").eq(&Ok("1".into())) {
        env::remove_var("SPIN_JS_WIZEN");

        let wasm: &[u8] = include_bytes!(concat!(env!("OUT_DIR"), "/engine.wasm"));

        let mut wasm = Wizer::new()
            .allow_wasi(true)?
            .inherit_stdio(true)
            .run(wasm)?;

        let codegen_cfg = CodegenConfig {
            optimization_level: 3,
            shrink_level: 0,
            debug_info: false,
        };

        if let Ok(mut module) = Module::read(&wasm) {
            module.optimize(&codegen_cfg);
            module
                .run_optimization_passes(vec!["strip"], &codegen_cfg)
                .unwrap();
            wasm = module.write();
        } else {
            bail!("Unable to read wasm binary for wasm-opt optimizations");
        }

        std::fs::write(&opts.output, wasm)?;

        return Ok(());
    }

    let module = fs::read_to_string(&opts.input)
        .with_context(|| format!("Failed to read input file {}", opts.input.display()))?;

    let tmp = unsafe {
        let rt = JS_NewRuntime();
        let ctx = JS_NewContext(rt);
        let name = CString::new("script.js").unwrap();
        let module = CString::new(module)?;
        let obj = JS_Eval(
            ctx,
            module.as_ptr(),
            module.as_bytes().len().try_into()?,
            name.as_ptr(),
            (JS_EVAL_FLAG_COMPILE_ONLY | JS_EVAL_TYPE_GLOBAL).try_into()?,
        );
        if JS_IsException(obj) {
            bail!("{}", exception_to_string(ctx));
        }

        let mut len = 0;
        let buf = JS_WriteObject(ctx, &mut len, obj, JS_WRITE_OBJ_BYTECODE.try_into()?);

        let mut tmp = tempfile::tempfile()?;

        tmp.write_all(slice::from_raw_parts(buf, len.try_into()?))?;
        tmp.seek(SeekFrom::Start(0))?;

        tmp
    };

    let self_cmd = env::args().next().unwrap();

    env::set_var("SPIN_JS_WIZEN", "1");
    let status = Command::new(self_cmd)
        .arg(&opts.input)
        .arg("-o")
        .arg(&opts.output)
        .stdin(tmp)
        .status()?;

    if !status.success() {
        bail!("Couldn't create wasm from input");
    }

    Ok(())
}
