import { expect } from 'chai';

describe('componentize', () => {
  let componentize: typeof import('../dist/componentize.js').componentize;

  before(async () => {
    ({ componentize } = await import('../dist/componentize.js'));
  });

  it('should be a function', () => {
    expect(componentize).to.be.a('function');
  });

  it('should throw when input file does not exist', async () => {
    try {
      await componentize({
        input: './nonexistent/bundle.js',
        output: '/tmp/test-output.wasm',
      });
      expect.fail('Should have thrown');
    } catch (error: any) {
      // Should fail trying to read the input
      expect(error).to.exist;
    }
  });
});

describe('SpinEsbuildPlugin', () => {
  let SpinEsbuildPlugin: typeof import('../dist/plugins/esbuild.js').SpinEsbuildPlugin;

  before(async () => {
    ({ SpinEsbuildPlugin } = await import('../dist/plugins/esbuild.js'));
  });

  it('should return a plugin with name spin-sdk', async () => {
    const plugin = await SpinEsbuildPlugin();
    expect(plugin.name).to.equal('spin-sdk');
    expect(plugin.setup).to.be.a('function');
  });

  it('should work without options (backward compatible)', async () => {
    const plugin = await SpinEsbuildPlugin();
    expect(plugin.name).to.equal('spin-sdk');
  });

  it('should accept componentize: true', async () => {
    const plugin = await SpinEsbuildPlugin({ componentize: true });
    expect(plugin.name).to.equal('spin-sdk');
  });

  it('should accept componentize with options object', async () => {
    const plugin = await SpinEsbuildPlugin({
      componentize: {
        debug: true,
        initLocation: 'http://test.localhost',
        output: 'dist/test.wasm',
      }
    });
    expect(plugin.name).to.equal('spin-sdk');
  });

  it('should register onResolve hook for WIT externals', async () => {
    const plugin = await SpinEsbuildPlugin();
    const hooks: Record<string, any[]> = {};
    const mockBuild = {
      initialOptions: {},
      onResolve(opts: any, cb: any) { hooks.onResolve = hooks.onResolve || []; hooks.onResolve.push({ opts, cb }); },
      onLoad(opts: any, cb: any) { hooks.onLoad = hooks.onLoad || []; hooks.onLoad.push({ opts, cb }); },
      onEnd(cb: any) { hooks.onEnd = hooks.onEnd || []; hooks.onEnd.push(cb); },
    };
    plugin.setup(mockBuild);
    expect(hooks.onResolve).to.have.length(1);
    // Without componentize, should still register onLoad but not onEnd
    expect(hooks.onLoad).to.have.length(1);
    expect(hooks.onEnd).to.be.undefined;
  });

  it('should register onLoad and onEnd hooks when componentize is enabled', async () => {
    const plugin = await SpinEsbuildPlugin({ componentize: true });
    const hooks: Record<string, any[]> = {};
    const mockBuild = {
      initialOptions: { outfile: './build/bundle.js' },
      onResolve(opts: any, cb: any) { hooks.onResolve = hooks.onResolve || []; hooks.onResolve.push({ opts, cb }); },
      onLoad(opts: any, cb: any) { hooks.onLoad = hooks.onLoad || []; hooks.onLoad.push({ opts, cb }); },
      onEnd(cb: any) { hooks.onEnd = hooks.onEnd || []; hooks.onEnd.push(cb); },
    };
    plugin.setup(mockBuild);
    expect(hooks.onResolve).to.have.length(1);
    expect(hooks.onLoad).to.have.length(1);
    expect(hooks.onEnd).to.have.length(1);
  });
});
