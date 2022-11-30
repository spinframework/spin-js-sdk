#![deny(warnings)]

#[cfg(not(target_os = "windows"))]
use binaryen::{CodegenConfig, Module};
use {
    anyhow::{bail, Context, Result},
    std::{
        env,
        fs::{self, File},
        path::PathBuf,
        process::Command,
    },
    structopt::StructOpt,
    wizer::Wizer,
};

#[derive(Debug, StructOpt)]
#[structopt(name = "spin-js-cli", about = "JavaScript to Spin module utility")]
pub struct Options {
    #[structopt(parse(from_os_str))]
    pub input: PathBuf,

    #[structopt(short = "o", parse(from_os_str), default_value = "index.wasm")]
    pub output: PathBuf,
}

fn main() -> Result<()> {
    let opts = Options::from_args();

    if env::var("SPIN_JS_WIZEN").eq(&Ok("1".into())) {
        env::remove_var("SPIN_JS_WIZEN");

        let wasm: &[u8] = include_bytes!(concat!(env!("OUT_DIR"), "/engine.wasm"));

        // using binaryen on windows causes spinjs to silently generate malformed wasm
        #[cfg(target_os = "windows")]
        {
            let wasm = Wizer::new()
                .allow_wasi(true)?
                .inherit_stdio(true)
                .run(wasm)?;
            fs::write(&opts.output, wasm)?;
        }
        #[cfg(not(target_os = "windows"))]
        {
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

            fs::write(&opts.output, wasm)?;
        }

        return Ok(());
    }

    let script = File::open(&opts.input)
        .with_context(|| format!("Failed to open input file {}", opts.input.display()))?;

    let self_cmd = env::args().next().unwrap();

    env::set_var("SPIN_JS_WIZEN", "1");
    let status = Command::new(self_cmd)
        .arg(&opts.input)
        .arg("-o")
        .arg(&opts.output)
        .stdin(script)
        .status()?;

    if !status.success() {
        bail!("Couldn't create wasm from input");
    }

    Ok(())
}
