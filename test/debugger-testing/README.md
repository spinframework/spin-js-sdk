## Debugger test apps

Apps in this directory can be used for testing the StarlingMonkey debugger against the Spin runtime.
They are not intended for testing the SDK itself, or as example applications.

- Load the extension (https://github.com/bytecodealliance/StarlingMonkey/tree/main/debugger/vscode-dap-extension) into VS Code and run `npm run esbuild-all`.
- Update the `launch.json` (https://github.com/bytecodealliance/StarlingMonkey/blob/main/debugger/vscode-dap-extension/.vscode/launch.json) to point to the test Spin app you want to exercise.
- Hit F5. This loads the Spin app the extension development host with the debugger extension loaded.
- Set any desired breakpoints or whatever on the Spin app - whatever debugger functionality you want to test.
- Run `spin build` and hit F5.
- Make a request to the Spin app (e.g. `curl localhost:3000`) and verify the debugger does whatever you need it to do!
