# node-elm-compiler [![Version](https://img.shields.io/npm/v/node-elm-compiler.svg)](https://www.npmjs.com/package/node-elm-compiler) [![Travis build Status](https://travis-ci.org/rtfeldman/node-elm-compiler.svg?branch=master)](http://travis-ci.org/rtfeldman/node-elm-compiler) [![AppVeyor build status](https://ci.appveyor.com/api/projects/status/xv83jcomgb81i1iu/branch/master?svg=true)](https://ci.appveyor.com/project/rtfeldman/node-elm-compiler/branch/master)

Wraps [Elm](https://elm-lang.org) and exposes a [Node](https://nodejs.org) API to compile Elm 0.19 sources.

# Example

```bash
$ npm install
$ npm run build
$ cd examples
$ node compileHelloWorld.js
```

# Releases

## 5.0.5

Upgrade find-elm-dependencies and lodash dependencies to fix CVE-2020-8203 vulnerability.

## 5.0.2

Upgrade lodash dependency to fix security audit warning. ([#93](https://github.com/rtfeldman/node-elm-compiler/pull/93))

## 5.0.1

Add helpful errors if you use the obsolete `warn` and `pathToMake` flags. ([#75](https://github.com/rtfeldman/node-elm-compiler/pull/75))

## 5.0.0

Add 0.19 support. Remove `yes` option. Add `optimize` option. Throw exceptions instead of emitting warnings or using process.exit.

## 4.5.0

Add `runtimeOptions`

## 4.4.0

Add `compileToStringSync`

## 4.3.1

Upgrade `findAllDependencies` dependency to correctly report all dependencies within a multi-source-directory project.

## 4.3.0

Add `compileSync` via @yormi

## 4.2.1

Epic perf improvements from @eeue56

## 4.2.0

Add support for `--debug` flag.

## 4.1.5

Clean up temporary directories more safely.

## 4.1.4

`findAllDependencies` now supports `port module` files.

## 4.1.3

Use utf-8 encoding for `compileToString`

## 4.1.2

Support checking dependencies for modules with no module declaration.

## 4.1.1

Fix bug in dependency searches beginning with a non-root `Main` module.

## 4.1.0

Log elm-make output in verbose mode.

## 4.0.1

Fix missing `temp` dependency.

## 4.0.0

Use an `Error` object for result errors instead of a string.

## 3.0.0

Passing the `warn` option now passes `--warn` to `elm-make`, and `emitWarning` now controls warning logging.

## 2.3.3

Fix bug where nonzero exit codes were not rejecting promises.

## 2.3.2

Fix bug related to converting module dots to directories in nested dependency
resolution.

## 2.3.1

Move `temp` dependency out of `devDependencies`

## 2.3.0

Added #compileToString

## 2.2.0

Added `cwd` to `options` and fixed a bug where Windows couldn't find `elm-make`.

## 2.1.0

Added #findAllDependencies

## 2.0.0

No longer searches `node_modules/.bin` for `elm-make` - now if you don't specify
a `pathToMake` option, only the one on PATH will be used as a fallback.

## 1.0.0

Initial release.
