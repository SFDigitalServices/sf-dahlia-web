#!/bin/bash
set -e

# Clean up temporary files on exit
trap 'rm -f app/assets/json/translations/react/*.tmp' EXIT

# Check if jq is installed
# Node-jq guarantees that jq will be installed in this location. More information: https://www.npmjs.com/package/node-jq#advanced-installation
echo "Checking if node-jq is installed via Yarn..."
if ! yarn list --depth=0 | grep -q "node-jq@"; then
  echo "node-jq is not installed. Please run 'yarn install' and try again."
  exit 1
fi

# Sort JSON files
for file in app/assets/json/translations/react/*.json; do
    echo "Sorting $file with jq..."
    ./node_modules/node-jq/bin/jq -S '.' "$file" > "$file.tmp"
    mv "$file.tmp" "$file"
done

echo "All React translation files have been sorted."