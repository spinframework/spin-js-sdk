#!/usr/bin/env bash

set -euo pipefail

spin_pid=""

start_spin() {
  spin up &
  spin_pid=$!
}

stop_spin() {
  if [[ -n "$spin_pid" ]]; then
    kill "$spin_pid" 2>/dev/null || true
    wait "$spin_pid" 2>/dev/null || true
    spin_pid=""
  fi
}

wait_for_http() {
  local url=$1
  local deadline=$((SECONDS + 60))
  local status

  while true; do
    status=$(curl --silent --output /dev/null --write-out '%{http_code}' "$url" || true)
    if [[ "$status" == "200" ]]; then
      return
    fi
    if (( SECONDS >= deadline )); then
      echo "Spin app did not return HTTP 200 in 60 seconds"
      return 1
    fi
    echo "Current status: $status, waiting..."
    sleep 2
  done
}

trap stop_spin EXIT

# Build the npm package
cd ..
for d in packages/*; do
    echo "Building $d"
    cd $d
    # Legacy peer deps will allow us to ignore the unmet peer dependency warning for build-tools, which is not needed for building the packages themselves.
    # We only need it when we build apps that consume said packages.
    npm install --legacy-peer-deps
    npm run build
    cd -
done
cd test

isFailed=false
# Build test app
echo "Building the test app"
cd test-app
npm install 
spin build
echo "built the test app successfully"


# Start the spin app in the background
echo "Starting Spin app"
start_spin

# wait for app to be up and running
echo "Waiting for Spin app to be ready"
wait_for_http http://localhost:3000/health

# start the test
echo "Starting test\n"
curl -f http://localhost:3000/testFunctionality || isFailed=true
echo "\n\nTest completed"

# kill the spin app
echo "Stopping Spin"
stop_spin


if [ "$isFailed" = true ] ; then
    echo "Some tests failed"
    exit 1
fi

# return back to test folder
cd ..

# Test the no regex precompile

cd test-empty-precompile
spin build
start_spin
echo "Teting app with no regex to precompile"

wait_for_http http://localhost:3000/health

stop_spin

# Test the AOT compilation

cd ../aot-test
spin build
start_spin
echo "Testing app with AOT compilation"
wait_for_http http://localhost:3000/.well-known/spin/health

# test the fibonacci function for 32
response=$(curl -s http://localhost:3000/fibonacci/32) 
echo "Fibonacci(32) = $response"

stop_spin


# Test the component dependencies
cd ../deps-test
npm install
npm run build-dependency-component
spin build
start_spin
echo "Testing component dependencies"
wait_for_http http://localhost:3000/.well-known/spin/health
response=$(curl -s http://localhost:3000/)
echo "Response from component with dependencies: $response"
stop_spin
