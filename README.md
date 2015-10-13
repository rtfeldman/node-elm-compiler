# node-elm-compiler

Wraps [Elm](https://elm-lang.org) and exposes a [Node](https://nodejs.org) API to compile Elm sources.

By default uses the `elm-make` executable you have installed on your system,
but you can optionally specify a different `elm-make` to use.

Supports Elm versions 0.15 - 0.16

# Example

```bash
$ npm install
$ cd examples
$ node compileHelloWorld.js
```
