# Cutting a new release for the JS SDK

To cut a new release for the sdk, you will need to do the following,

1. Create a new pull request that changes the version number of the cargo.toml of both `spin-js-cli` and `spin-js-engine` crates. Also make sure to update the version number of the number of the `spin-sdk` NPM package in `types/package.json`.

1. Merge PR created in step #1 (Such PRs are still required to get approvals, so make sure you get signoff on the PR).

1. Push the update NPM package to the NPM registry.

1. Update `package.json` in the examples and templates to point at the new NPM package.

2. Create a new tag with a `v` and then the version number.

3. Push the tag upstream to trigger the release action.
    - The release build will create the packaged version of the plugins and the checksums and upload to github releases.
    - Release notes are auto-generated but edit as needed especially around breaking changes or other notable items.
  
4. Update `fermyon/spin-plugins` repository with the updated manifest.

At this point, you can just verify that all things are good.