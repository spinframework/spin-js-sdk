set -euo pipefail

# Build the npm package
cd ..
for d in packages/*; do
    echo "Building $d"
    cd $d
    npm install
    npm audit
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
spin up &

# wait for app to be up and running
echo "Waiting for Spin app to be ready"
timeout 60s bash -c 'until curl --silent -f http://localhost:3000/health > /dev/null; do sleep 2; done'

# start the test
echo "Starting test\n"
curl -f http://localhost:3000/testFunctionality || isFailed=true
echo "\n\nTest completed"

# kill the spin app
echo "Stopping Spin"
killall spin


if [ "$isFailed" = true ] ; then
    echo "Some tests failed"
    exit 1
fi

# return back to test folder
cd ..

# Test the no regex precompile

cd test-empty-precompile
spin build
spin up &
echo "Teting app with no regex to precompile"

if ! timeout 60s bash -c '
  until status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health) && [ "$status" -eq 200 ]; do
    echo "Current status: $status, waiting..."
    sleep 2
  done
'; then
  echo "Spin app did not return HTTP 200 in 60 seconds"
  exit 1
fi

killall spin

# Test the AOT compilation

cd ../aot-test
spin build
spin up &
echo "Testing app with AOT compilation"
if ! timeout 60s bash -c '
  until status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/.well-known/spin/health) && [ "$status" -eq 200 ]; do
    echo "Current status: $status, waiting..."
    sleep 2
  done
'; then
  echo "Spin app did not return HTTP 200 in 60 seconds"
  exit 1
fi

# test the fibonacci function for 32
response=$(curl -s http://localhost:3000/fibonacci/32) 
echo "Fibonacci(32) = $response"

killall spin
