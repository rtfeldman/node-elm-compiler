# node-elm-compiler

Wraps [Elm](https://elm-lang.org) and exposes a [Node](https://nodejs.org) API to compile Elm sources.

Obtains the `elm-make` executable to use in the following way:

1. If you programmatically specify a path to `elm-make` through the API, runs that.
2. If you do not, looks for an `elm` installation in `node_modules` and runs that.
3. If that is not present, assumes `elm-make` is on your PATH and runs that.

Supports Elm versions 0.15 - 0.16

# Example

```bash
$ npm install
$ cd examples
$ node compileHelloWorld.js
```
