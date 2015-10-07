# node-elm-compiler

Wraps [elm-bin](https://github.com/kevva/elm-bin) and exposes a [Node](https://nodejs.org) API to compile Elm sources.

Note that Elm is listed as a [peerDependency](https://nodejs.org/en/blog/npm/peer-dependencies/) here, so make sure to add both `node-elm-compiler` **and** `elm` to the `dependencies` section of your package.json file.

Current Elm version is 0.16.

# Example

```bash
$ npm install
$ cd examples
$ node compileHelloWorld.js
```
