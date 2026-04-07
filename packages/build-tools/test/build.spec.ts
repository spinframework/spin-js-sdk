import { getBuildDataPath, ShouldComponentize } from '../dist/build.js';
import { expect } from 'chai';
import fs from 'fs';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'path';
import os from 'os';

describe('getBuildDataPath', () => {
  it('should append .buildData.json to the source path', () => {
    expect(getBuildDataPath('src/index.js')).to.equal(
      'src/index.js.buildData.json',
    );
  });

  it('should work with absolute paths', () => {
    expect(getBuildDataPath('/home/user/project/src/main.js')).to.equal(
      '/home/user/project/src/main.js.buildData.json',
    );
  });

  it('should handle paths with dots', () => {
    expect(getBuildDataPath('app.bundle.min.js')).to.equal(
      'app.bundle.min.js.buildData.json',
    );
  });
});

describe('ShouldComponentize', () => {
  let tmpDir: string;

  before(async () => {
    tmpDir = path.join(os.tmpdir(), `build-tools-test-sc-${Date.now()}`);
    await mkdir(tmpDir, { recursive: true });
  });

  after(async () => {
    await fs.promises.rm(tmpDir, { recursive: true, force: true });
  });

  it('should return true when no build data exists', async () => {
    const srcPath = path.join(tmpDir, 'new-source.js');
    await writeFile(srcPath, 'console.log("hello");');
    const outputPath = path.join(tmpDir, 'component.wasm');

    const result = await ShouldComponentize(
      srcPath,
      outputPath,
      '1.0.0',
      '',
      'wit-hash',
    );
    expect(result).to.be.true;
  });

  it('should return true when output file does not exist', async () => {
    const srcPath = path.join(tmpDir, 'existing-source.js');
    await writeFile(srcPath, 'console.log("hello");');

    // Create build data that matches
    const { calculateChecksum } = await import('../dist/utils.js');
    const { saveBuildData } = await import('../dist/utils.js');
    const checksum = await calculateChecksum(
      await fs.promises.readFile(srcPath),
    );
    const buildDataPath = `${srcPath}.buildData.json`;
    await saveBuildData(buildDataPath, checksum, '1.0.0', '', 'wit-hash');

    // Output file doesn't exist
    const outputPath = path.join(tmpDir, 'missing-output.wasm');

    const result = await ShouldComponentize(
      srcPath,
      outputPath,
      '1.0.0',
      '',
      'wit-hash',
    );
    expect(result).to.be.true;
  });

  it('should return false when everything matches', async () => {
    const srcPath = path.join(tmpDir, 'matching-source.js');
    await writeFile(srcPath, 'console.log("matched");');
    const outputPath = path.join(tmpDir, 'matching-output.wasm');
    await writeFile(outputPath, 'fake-wasm-content');

    const { calculateChecksum } = await import('../dist/utils.js');
    const { saveBuildData } = await import('../dist/utils.js');
    const checksum = await calculateChecksum(
      await fs.promises.readFile(srcPath),
    );
    const buildDataPath = `${srcPath}.buildData.json`;
    await saveBuildData(buildDataPath, checksum, '1.0.0', '--debug', 'wit-xyz');

    const result = await ShouldComponentize(
      srcPath,
      outputPath,
      '1.0.0',
      '--debug',
      'wit-xyz',
    );
    expect(result).to.be.false;
  });

  it('should return true when source content changes', async () => {
    const srcPath = path.join(tmpDir, 'changed-source.js');
    await writeFile(srcPath, 'original content');
    const outputPath = path.join(tmpDir, 'changed-output.wasm');
    await writeFile(outputPath, 'fake-wasm');

    const { calculateChecksum } = await import('../dist/utils.js');
    const { saveBuildData } = await import('../dist/utils.js');
    const oldChecksum = await calculateChecksum(
      await fs.promises.readFile(srcPath),
    );
    const buildDataPath = `${srcPath}.buildData.json`;
    await saveBuildData(
      buildDataPath,
      oldChecksum,
      '1.0.0',
      '',
      'wit-hash',
    );

    // Now change the source
    await writeFile(srcPath, 'modified content');

    const result = await ShouldComponentize(
      srcPath,
      outputPath,
      '1.0.0',
      '',
      'wit-hash',
    );
    expect(result).to.be.true;
  });

  it('should return true when componentize version changes', async () => {
    const srcPath = path.join(tmpDir, 'version-source.js');
    await writeFile(srcPath, 'version test');
    const outputPath = path.join(tmpDir, 'version-output.wasm');
    await writeFile(outputPath, 'fake-wasm');

    const { calculateChecksum } = await import('../dist/utils.js');
    const { saveBuildData } = await import('../dist/utils.js');
    const checksum = await calculateChecksum(
      await fs.promises.readFile(srcPath),
    );
    const buildDataPath = `${srcPath}.buildData.json`;
    await saveBuildData(buildDataPath, checksum, '1.0.0', '', 'wit-hash');

    const result = await ShouldComponentize(
      srcPath,
      outputPath,
      '2.0.0', // different version
      '',
      'wit-hash',
    );
    expect(result).to.be.true;
  });

  it('should return true when runtimeArgs changes', async () => {
    const srcPath = path.join(tmpDir, 'args-source.js');
    await writeFile(srcPath, 'args test');
    const outputPath = path.join(tmpDir, 'args-output.wasm');
    await writeFile(outputPath, 'fake-wasm');

    const { calculateChecksum } = await import('../dist/utils.js');
    const { saveBuildData } = await import('../dist/utils.js');
    const checksum = await calculateChecksum(
      await fs.promises.readFile(srcPath),
    );
    const buildDataPath = `${srcPath}.buildData.json`;
    await saveBuildData(buildDataPath, checksum, '1.0.0', '', 'wit-hash');

    const result = await ShouldComponentize(
      srcPath,
      outputPath,
      '1.0.0',
      '--enable-script-debugging', // different args
      'wit-hash',
    );
    expect(result).to.be.true;
  });

  it('should return true when targetWitChecksum changes', async () => {
    const srcPath = path.join(tmpDir, 'wit-source.js');
    await writeFile(srcPath, 'wit test');
    const outputPath = path.join(tmpDir, 'wit-output.wasm');
    await writeFile(outputPath, 'fake-wasm');

    const { calculateChecksum } = await import('../dist/utils.js');
    const { saveBuildData } = await import('../dist/utils.js');
    const checksum = await calculateChecksum(
      await fs.promises.readFile(srcPath),
    );
    const buildDataPath = `${srcPath}.buildData.json`;
    await saveBuildData(buildDataPath, checksum, '1.0.0', '', 'old-wit-hash');

    const result = await ShouldComponentize(
      srcPath,
      outputPath,
      '1.0.0',
      '',
      'new-wit-hash', // different wit hash
    );
    expect(result).to.be.true;
  });
});
