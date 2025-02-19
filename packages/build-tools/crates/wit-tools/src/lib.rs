use anyhow::anyhow;
use std::path::{Path, PathBuf};
use wit_component::WitPrinter;
use wit_parser::{PackageId, Resolve};

wit_bindgen::generate!({
    world: "tools",
});

// Core domain types
#[derive(Debug)]
struct WitMerger {
    resolve: Resolve,
    base_world_id: Option<id_arena::Id<wit_parser::World>>,
}

// Configuration structures
#[derive(Debug)]
struct MergeConfig {
    output_package: String,
    output_world: String,
}

impl Default for MergeConfig {
    fn default() -> Self {
        Self {
            output_package: "local:combined-wit@0.1.0".to_owned(),
            output_world: "combined".to_owned(),
        }
    }
}

impl WitMerger {
    fn new() -> Self {
        Self {
            resolve: Resolve::default(),
            base_world_id: None,
        }
    }

    fn initialize_with_config(&mut self, config: &MergeConfig) -> anyhow::Result<PackageId> {
        let id = self.resolve.push_str(
            "component.wit",
            &create_target_wit_source(&config.output_package, &config.output_world),
        )?;

        self.base_world_id = self.find_world_by_name(&config.output_world);
        Ok(id)
    }

    fn merge_wit_paths(&mut self, wit_paths: Vec<String>) -> anyhow::Result<()> {
        for path in wit_paths {
            let (temp_resolve, _) = parse_wit_file(&PathBuf::from(path))?;
            self.resolve.merge(temp_resolve)?;
        }
        Ok(())
    }

    fn merge_target_worlds(&mut self, worlds: Vec<TargetWorld>) -> anyhow::Result<()> {
        let base_world = self
            .base_world_id
            .ok_or_else(|| anyhow!("Base world not initialized"))?;

        for target in worlds {
            let (_pkg_id, world_id) = self.find_target_world(&target)?;
            self.resolve
                .merge_worlds(world_id, base_world)
                .map_err(|e| {
                    anyhow!(
                        "Failed to merge world '{}/{}': {}",
                        target.package_name,
                        target.world_name,
                        e
                    )
                })?;
        }
        Ok(())
    }

    fn collect_imports(&self) -> anyhow::Result<Vec<String>> {
        let base_world = self
            .base_world_id
            .ok_or_else(|| anyhow!("Base world not initialized"))?;

        let mut imports = Vec::new();
        for (_, item) in self.resolve.worlds[base_world].imports.iter() {
            match item {
                wit_parser::WorldItem::Interface { id, stability: _ } => {
                    if let Some(import_string) = self.format_interface_import(id) {
                        imports.push(import_string);
                    }
                }
                // TODO: Figure out how to deal with functions
                wit_parser::WorldItem::Function(_) => todo!(),
                // Do nothing for types because COomponentizeJS does not
                // generate bindings for types
                wit_parser::WorldItem::Type(_) => {}
            }
        }
        Ok(imports)
    }

    fn format_interface_import(&self, id: &wit_parser::InterfaceId) -> Option<String> {
        let interface = &self.resolve.interfaces[id.clone()];
        let package = interface.package.and_then(|pkg_id| {
            let pkg = &self.resolve.packages[pkg_id];
            Some(&pkg.name)
        })?;

        // TODO: Check if unwrap_or_default is a problem and if so, fix it
        let iname = interface.name.clone().unwrap_or_default();
        let interface_name = format!("{}:{}/{}", package.namespace, package.name, iname);
        if let Some(version) = &package.version {
            Some(format!("{}@{}", interface_name, version))
        } else {
            Some(interface_name)
        }
    }

    fn find_world_by_name(&self, name: &str) -> Option<id_arena::Id<wit_parser::World>> {
        self.resolve
            .worlds
            .iter()
            .find(|(_, world)| world.name == name)
            .map(|(id, _)| id)
    }

    fn find_target_world(
        &self,
        target: &TargetWorld,
    ) -> anyhow::Result<(PackageId, id_arena::Id<wit_parser::World>)> {
        let pkg_id = self
            .find_package_by_name(&target.package_name)
            .ok_or_else(|| anyhow!("Package not found: {}", target.package_name))?;

        let pkg = &self.resolve.packages[pkg_id];
        let world_id = pkg
            .worlds
            .iter()
            .find(|(_, world_id)| self.resolve.worlds[**world_id].name == target.world_name)
            .map(|(_, world_id)| *world_id)
            .ok_or_else(|| anyhow!("World not found: {}", target.world_name))?;

        Ok((pkg_id, world_id))
    }

    fn find_package_by_name(&self, package_name: &str) -> Option<PackageId> {
        self.resolve
            .packages
            .iter()
            .find(|(_, p)| {
                let pkg_name = match &p.name.version {
                    Some(ver) => format!("{}:{}@{}", p.name.namespace, p.name.name, ver),
                    None => format!("{}:{}", p.name.namespace, p.name.name),
                };
                pkg_name == package_name
            })
            .map(|(id, _)| id)
    }
}

// Implementation of the guest trait
struct BuildTools;

impl Guest for BuildTools {
    /// Get a list of wit imports from the provided wit paths and target worlds
    /// Returns a list of wit imports as strings
    fn get_wit_imports(
        wit_paths: Vec<String>,
        worlds: Vec<TargetWorld>,
    ) -> Result<Vec<String>, String> {
        if wit_paths.is_empty() {
            return Err("No wit-paths provided".to_owned());
        }
        if worlds.is_empty() {
            return Err("No worlds provided to be knit".to_owned());
        }

        let mut merger = WitMerger::new();
        let config = MergeConfig::default();

        merger
            .initialize_with_config(&config)
            .and_then(|_| merger.merge_wit_paths(wit_paths))
            .and_then(|_| merger.merge_target_worlds(worlds))
            .and_then(|_| merger.collect_imports())
            .map_err(|e| e.to_string())
    }

    fn merge_wit(
        wit_paths: Vec<String>,
        worlds: Vec<TargetWorld>,
        output_world: Option<String>,
        output_package: Option<String>,
    ) -> Result<String, String> {
        if wit_paths.is_empty() {
            return Err("No wit-paths provided".to_owned());
        }
        if worlds.is_empty() {
            return Err("No worlds provided to be knit".to_owned());
        }

        let config = MergeConfig {
            output_package: output_package.unwrap_or_else(|| "local:combined-wit@0.1.0".to_owned()),
            output_world: output_world.unwrap_or_else(|| "combined".to_owned()),
        };

        let mut merger = WitMerger::new();
        merger
            .initialize_with_config(&config)
            .and_then(|id| {
                merger.merge_wit_paths(wit_paths)?;
                merger.merge_target_worlds(worlds)?;
                generate_wit_output(&merger.resolve, id)
            })
            .map_err(|e| e.to_string())
    }
}

// Helper functions
fn create_target_wit_source(package_name: &str, world_name: &str) -> String {
    format!("package {package_name};\n\nworld {world_name} {{\n}}")
}

fn parse_wit_file(path: &Path) -> anyhow::Result<(Resolve, PackageId)> {
    let mut resolve = Resolve::default();
    let id = if path.is_dir() {
        resolve.push_dir(path)?.0
    } else {
        resolve.push_file(path)?
    };
    Ok((resolve, id))
}

fn generate_wit_output(resolve: &Resolve, package_id: PackageId) -> anyhow::Result<String> {
    let mut printer = WitPrinter::default();
    printer.emit_docs(false);

    let excluded_ids: Vec<_> = resolve
        .packages
        .iter()
        .map(|(id, _)| id)
        .filter(|id| *id != package_id)
        .collect();

    printer.print(resolve, package_id, &excluded_ids)
}

export!(BuildTools);
