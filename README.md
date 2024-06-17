# Spin JS SDK

This is an SDK for Javascript and Typescript based on [ComponentizeJS](https://github.com/bytecodealliance/ComponentizeJS).


## Installing the templates

[Spin](https://github.com/fermyon/spin) is a prerequisite. 

The templates can be installed with the following command:

```bash
spin plugin install --update --git https://github.com/fermyon/spin-js-sdk --branch feat/sdk-v2
```

## Creating and building a new app

```bash
spin new -t http-ts hello-world -a
cd hello-world
npm install
spin buiild
```

## Running the app

```bash
spin up
```

## Note: Installing the package

Currently pre-release versions are published on NPM and can be installed using the following command: 

```bash
npm install @fermyon/spin-sdk@next
```