# Spin JS SDK

This is an SDK for Javascript and Typescript based on [ComponentizeJS](https://github.com/bytecodealliance/ComponentizeJS).

Note that this SDK supersedes an earlier, experimental version, which may be found in the [sdk-v1](https://github.com/fermyon/spin-python-sdk/tree/old-sdk) branch.

## [API Documentation](https://fermyon.github.io/spin-js-sdk)

## Installing the templates

[Spin](https://github.com/fermyon/spin) is a prerequisite. 

The templates can be installed with the following command:

```bash
spin templates install --update --git https://github.com/fermyon/spin-js-sdk 
```

## Creating and building a new app

Create a new app from the template installed in the previous step:

```bash
spin new -t http-ts hello-world -a
```
Change directory into the app:
```bash
cd hello-world
```

Install the dependencies and build the app:
```bash
npm install
spin buiild
```

## Running the app

```bash
spin up
```

Finally, you can test your app using e.g. `curl` in another terminal:

```shell
curl -i http://127.0.0.1:3000
```

If all goes well, you should see something like:

```
HTTP/1.1 200 OK
content-type: text/plain
content-length: 18
date: Thu, 11 Apr 2024 17:42:31 GMT

Hello from Python!
```

Please file an issue if you have any trouble.

See the [examples directory](https://github.com/fermyon/spin-js-sdk/tree/main/examples) in the repository for more examples.

To learn more about the JS SDK checkout the [documentation](https://developer.fermyon.com/spin/v2/javascript-components)