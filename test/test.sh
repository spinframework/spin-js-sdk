#!/bin/bash

set -euo pipefail

# Build the npm package
cd ../spin-sdk
npm install 
npm run build
cd -

isFailed=false
# Build test app
echo "Building the test app"
cd test-app
npm install > /dev/null
spin build > /dev/null
echo "built the test app successfully"


# Start the spin app in the background
echo "Starting Spin app"
spin up &

# wait for app to be up and running
echo "Waiting for Spin app to be ready"
timeout 60s bash -c 'until curl --silent -f http://localhost:3000/health > /dev/null; do sleep 2; done'

# start the test
echo -e "Starting test\n"
curl -f http://localhost:3000 || isFailed=true
echo -e "\n\nTest completed"

# kill the spin app
echo "Stopping Spin"
killall spin


if [ "$isFailed" = true ] ; then
    exit 1
fi

