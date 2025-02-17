#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Docs for older versions of Spin JS SDK should also be published
# Update the following array, to hold desired versions of spin-js-sdk (excluding current)

# Git Tags to use for historical docs generation
TAGS=("v0.6.1" "v2.3.0")

# Move to the root of the repository
cd "$(git rev-parse --show-toplevel)"

# Older versions of Spin JS SDK neither had neccessary dev dependencies for typedoc and
# its plugins specified nor a typedoc.jsonc

# Backup typedoc.jsonc to a temp folder
BACKUP_DIR="/tmp/typedoc_backup_$(date +%s)"
mkdir -p "$BACKUP_DIR"
cp typedoc.jsonc "$BACKUP_DIR/typedoc.jsonc"

# First, let's generate docs for older versions of Spin JS SDK
for TAG in "${TAGS[@]}"; do
  # Checkout the tag
  git checkout "tags/$TAG" -q

  # Oldest Spin SDK versions were placed in a spin-sdk sub-folder...
  if [[ "$TAG" == "v0.6.1" ]]; then
    cd spin-sdk
  fi
  # Ensure we're using latest typedoc and typedoc plugins
  # to generate consistant docs
  npm install typedoc@latest typedoc-plugin-missing-exports@latest @shipgirl/typedoc-plugin-versions --include=dev
  # Restore the backed-up typedoc.jsonc
  cp "$BACKUP_DIR/typedoc.jsonc" ./typedoc.jsonc

  # Run typedoc
  # Oldes Spin SDK versions were placed in a spin-sdk sub-folder...
  if [[ "$TAG" == "v0.6.1" ]]; then
    npx typedoc --out ../docs
  else
    npx typedoc
  fi

  rm typedoc.jsonc
  git restore package.json package-lock.json
  cd "$(git rev-parse --show-toplevel)"

  rm ./docs/index.html
  # Stash the docs
  git stash -u
  git checkout main -q
  git stash pop
done

# Run typedoc
echo "Running TypeDoc on HEAD"
# Ensure we're using latest typedoc and typedoc plugins
# to generate consistant docs
npm install typedoc@latest typedoc-plugin-missing-exports@latest @shipgirl/typedoc-plugin-versions --include=dev
npx typedoc
echo "Script completed successfully."
