import { existsSync } from 'node:fs';
import path from 'node:path';

const SPIN_COMPONENT_DEPENDENCIES_FILE = 'spin-dependencies.wit';
const SPIN_COMPONENT_DEPENDENCIES_PACKAGE_NAME = 'root:component';
const SPIN_COMPONENT_DEPENDENCIES_WORLD_NAME = 'root';

function getSpinComponentDependencies(): { witPath: string; packageName: string; worldName: string } | null {
  const spinComponentDepsPath = path.join(process.cwd(), SPIN_COMPONENT_DEPENDENCIES_FILE);
  console.log(`Checking for ${SPIN_COMPONENT_DEPENDENCIES_FILE} at path: ${spinComponentDepsPath}`);
  if (existsSync(spinComponentDepsPath)) {
    console.log(`Found ${SPIN_COMPONENT_DEPENDENCIES_FILE}, including it in the componentization process.`);
    return {
      witPath: spinComponentDepsPath,
      packageName: SPIN_COMPONENT_DEPENDENCIES_PACKAGE_NAME,
      worldName: SPIN_COMPONENT_DEPENDENCIES_WORLD_NAME,
    };
  }
  return null;
}

export { getSpinComponentDependencies };