set -euo pipefail

# Build the npm package
cd ..
for d in packages/*; do
    echo "Building $d"
    cd $d
    npm install
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
