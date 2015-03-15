/*
 * node-elm-compiler
 * https://github.com/rfeldman/node-elm-compiler
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var spawnChildProcess = require('child_process').spawn;
var _                 = require('lodash');

var defaultOptions     = {
  warn:       console.warn,
  pathToMake: __dirname + "/node_modules/elm-platform-bin/bin/elm-make",
  spawn:      spawnChildProcess,
  cwd:        process.cwd(),
  yes:        undefined,
  help:       undefined,
  output:     undefined,
  stdio:      "inherit"
};

var supportedOptions = _.keys(defaultOptions);

function compile(sources, options) {
  if (typeof sources === "string") {
    sources = [sources];
  }

  if (!(sources instanceof Array)) {
    throw "compile() received neither an Array nor a String for its sources argument."
  }

  options = _.defaults({}, options, defaultOptions);

  if (typeof options.spawn !== "function") {
    throw "options.spawn was a(n) " + (typeof options.spawn) + " instead of a function."
  }

  var compilerArgs = compilerArgsFromOptions(options, options.warn);
  var processArgs  = sources ? sources.concat(compilerArgs) : compilerArgs;
  var spawnOpts    = {cwd: options.cwd, env: options.env, stdio: options.stdio}

  return options.spawn(options.pathToMake, processArgs, spawnOpts);
}

function escapePath(pathStr) {
  return pathStr.replace(/ /g, "\\ ");
}

// Converts an object of key/value pairs to an array of arguments suitable
// to be passed to child_process.spawn for elm-make.
function compilerArgsFromOptions(options, logWarning) {
  return _.flatten(_.map(options, function(value, opt) {
    if (value) {
      switch(opt) {
        case "yes":    return ["--yes"];
        case "help":   return ["--help"];
        case "output": return ["--output", escapePath(value)];
        default:
          if (supportedOptions.indexOf(opt) === -1) {
            logWarning('Unknown Elm compiler option: ' + opt);
          }

          return [];
      }
    } else {
      return [];
    }
  }));
}

module.exports = {
  compile: compile
};
