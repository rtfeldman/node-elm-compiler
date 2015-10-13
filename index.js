'use strict';

var spawnChildProcess = require('child_process').spawn;
var _                 = require('lodash');
var elmMakePath       = 'elm-make';

var defaultOptions     = {
  warn:       console.warn,
  pathToMake: elmMakePath,
  spawn:      spawnChildProcess,
  yes:        undefined,
  help:       undefined,
  output:     undefined,
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
  var env = _.merge({LANG: 'en_US.UTF-8'}, process.env);
  var processOpts = {env: env, stdio: "inherit"};

  return options.spawn(options.pathToMake, processArgs, processOpts);
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
