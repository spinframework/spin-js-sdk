set -euo pipefail

# Build the npm package
cd ..
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
SPIN_PID=$!

# wait for app to be up and running
echo "Waiting for Spin app to be ready"
timeout 60s bash -c 'until curl --silent -f http://localhost:3000/health > /dev/null; do sleep 2; done'

# start the test
echo "Starting test\n"
curl -f http://localhost:3000/testFunctionality || isFailed=true
echo "\n\nTest completed"

# kill the spin app
echo "Stopping Spin"
kill -9 $SPIN_PID


if [ "$isFailed" = true ] ; then
    echo "Some tests failed"
    exit 1
fi
