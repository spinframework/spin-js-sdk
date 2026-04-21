import { componentize } from '@bytecodealliance/componentize-js';
import { writeFile } from 'node:fs/promises';

const { component } = await componentize(`
  export const greeter = {
    greet(name) {
      return \`Hello, \${name}!\ from component\`;
    }
  }
`, `
  package component:greeter;
  interface greeter {
    greet: func(name: string) -> string;
  }
  world hello {
    export greeter;
  }
`);

await writeFile('greeter-component.wasm', component);