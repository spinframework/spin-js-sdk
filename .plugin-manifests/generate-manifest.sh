#!/bin/bash

if [ $# -ne 2 ]; then
  echo 1>&2 "Usage: $0 VERSION_STRING CHECKSUM_FILE"
  exit 3
fi

[ ! -f "$2" ] &&  echo -e  "The second argument has to be the checksum file\n\n"Usage: $0 VERSION_STRING CHECKSUM_FILE"" && exit 3

# The first argument is if the version (either the tag or canary)
# The second argument is the checksum file
SPIN_COMPAT_STRING=$(cat .plugin-manifests/plugin-spin-compat.txt )
VERSION=$1
PLUGIN_BINARY_VERSION_STRING=$1


# If canary release tag with epoch at the end as it is monotonic
if [[ $VERSION == "canary" ]]; then
    PLUGIN_VERSION=$(cat ./crates/spin-js-engine/Cargo.toml | grep version | head -n 1 | awk '{print $3}')
    VERSION="${PLUGIN_VERSION//\"}post.$(date +%s)" 
    PLUGIN_BINARY_VERSION_STRING="canary"
fi

# Gather the checksums

LINUX_ARM=$(cat $2 | grep "linux-aarch64" | awk '{print $1}')
LINUX_AMD=$(cat $2 | grep "linux-amd64" | awk '{print $1}')
MAC_ARM=$(cat $2 | grep "macos-aarch64" | awk '{print $1}')
MAC_AMD=$(cat $2 | grep "macos-amd64" | awk '{print $1}')
WINDOWS_AMD=$(cat $2 | grep "windows-amd64" | awk '{print $1}')

# Dump out the json manifest
cat <<EOF 
{
  "name": "js2wasm",
  "description": "A plugin to convert js files to Spin compatible modules",
  "homepage": "https://github.com/fermyon/spin-js-sdk",
  "version": "${VERSION//v}",
  "spinCompatibility": "${SPIN_COMPAT_STRING}",
  "license": "Apache-2.0",
  "packages": [
    {
      "os": "linux",
      "arch": "amd64",
      "url": "https://github.com/fermyon/spin-js-sdk/releases/download/${PLUGIN_BINARY_VERSION_STRING}/js2wasm-${PLUGIN_BINARY_VERSION_STRING}-linux-amd64.tar.gz",
      "sha256": "${LINUX_AMD}"
    },
    {
      "os": "linux",
      "arch": "aarch64",
      "url": "https://github.com/fermyon/spin-js-sdk/releases/download/${PLUGIN_BINARY_VERSION_STRING}/js2wasm-${PLUGIN_BINARY_VERSION_STRING}-linux-aarch64.tar.gz",
      "sha256": "${LINUX_ARM}"
    },
    {
      "os": "macos",
      "arch": "aarch64",
      "url": "https://github.com/fermyon/spin-js-sdk/releases/download/${PLUGIN_BINARY_VERSION_STRING}/js2wasm-${PLUGIN_BINARY_VERSION_STRING}-macos-aarch64.tar.gz",
      "sha256": "${MAC_ARM}"
    },
    {
      "os": "macos",
      "arch": "amd64",
      "url": "https://github.com/fermyon/spin-js-sdk/releases/download/${PLUGIN_BINARY_VERSION_STRING}/js2wasm-${PLUGIN_BINARY_VERSION_STRING}-macos-amd64.tar.gz",
      "sha256": "${MAC_AMD}"
    },
    {
      "os": "windows",
      "arch": "amd64",
      "url": "https://github.com/fermyon/spin-js-sdk/releases/download/${PLUGIN_BINARY_VERSION_STRING}/js2wasm-${PLUGIN_BINARY_VERSION_STRING}-windows-amd64.tar.gz",
      "sha256": "${WINDOWS_AMD}"
    }
  ]
}
EOF