'use strict';

var spawn = require("cross-spawn");
var _ = require("lodash");
var compilerBinaryName = "elm-make";
var fs = require("fs");
var path = require("path");
var temp = require("temp").track();
var firstline = require("firstline");
var depsLoader = require('./dependencies.js');
var glob = require("glob");

var defaultOptions     = {
  emitWarning: console.warn,
  spawn:      spawn,
  cwd:        undefined,
  pathToMake: undefined,
  yes:        undefined,
  help:       undefined,
  output:     undefined,
  report:     undefined,
  warn:       undefined,
  debug:      undefined,
  verbose:    false,
  processOpts: undefined,
};

var supportedOptions = _.keys(defaultOptions);

function prepareSources(sources) {
  if (!(sources instanceof Array || typeof sources === "string")) {
    throw "compile() received neither an Array nor a String for its sources argument.";
  }

  return typeof sources === "string" ? [sources] : sources;
}

function prepareOptions(options, spawnFn) {
  return _.defaults({ spawn: spawnFn }, options, defaultOptions);
}

function prepareProcessArgs(sources, options) {
  var preparedSources = prepareSources(sources);

  var compilerArgs = compilerArgsFromOptions(options, options.emitWarning);
  return preparedSources ? preparedSources.concat(compilerArgs) : compilerArgs;
}

function prepareProcessOpts(options) {
  var env = _.merge({LANG: 'en_US.UTF-8'}, process.env);
  return _.merge({ env: env, stdio: "inherit", cwd: options.cwd }, options.processOpts);

}

function runCompiler(sources, options, pathToMake) {
  if (typeof options.spawn !== "function") {
    throw "options.spawn was a(n) " + (typeof options.spawn) + " instead of a function.";
  }

  var processArgs = prepareProcessArgs(sources, options);
  var processOpts = prepareProcessOpts(options);

  if (options.verbose) {
    console.log(["Running", pathToMake].concat(processArgs || []).join(" "));
  }

  return options.spawn(pathToMake, processArgs, processOpts);
}

function handleCompilerError(err, pathToMake) {
  if ((typeof err === "object") && (typeof err.code === "string")) {
    handleError(pathToMake, err);
  } else {
    console.error("Exception thrown when attempting to run Elm compiler " + JSON.stringify(pathToMake) + ":\n" + err);
  }
  throw err;

  process.exit(1);
}

function compileSync(sources, options) {
  var optionsWithDefaults = prepareOptions(options, spawn.sync);
  var pathToMake = options.pathToMake || compilerBinaryName;

  try {
    return runCompiler(sources, optionsWithDefaults, pathToMake);
  } catch (err) {
    handleCompilerError(err, pathToMake);
  }
}

function compile(sources, options) {
  var optionsWithDefaults = prepareOptions(options, spawn);
  var pathToMake = options.pathToMake || compilerBinaryName;


  try {
    return runCompiler(sources, optionsWithDefaults, pathToMake)
      .on('error', function(err) {
        handleError(pathToMake, err);

        process.exit(1);
      });
  } catch (err) {
    handleCompilerError(err, pathToMake);
  }
}

function getBaseDir(file) {
  return firstline(file).then(function(line) {
    return new Promise(function(resolve, reject) {
      var matches = line.match(/^(?:port\s+)?module\s+([^\s]+)/);

      if (matches) {
        // e.g. Css.Declarations
        var moduleName = matches[1];

        // e.g. Css/Declarations
        var dependencyLogicalName = moduleName.replace(/\./g, "/");

        // e.g. ../..
        var backedOut = dependencyLogicalName.replace(/[^/]+/g, "..");

        // e.g. /..
        var trimmedBackedOut = backedOut.replace(/^../, "");

        return resolve(path.normalize(path.dirname(file) + trimmedBackedOut));
      } else if (!line.match(/^(?:port\s+)?module\s/)) {
        // Technically you're allowed to omit the module declaration for
        // beginner applications where it'd just be `module Main exposing (..)`
        // If there is no module declaration, we'll assume we have one of these,
        // and succeed with the file's directory itself.
        //
        // See https://github.com/rtfeldman/node-elm-compiler/pull/36

        return resolve(path.dirname(file));
      }

      return reject(file + " is not a syntactically valid Elm module. Try running elm-make on it manually to figure out what the problem is.");
    });
  });
}

// Returns a Promise that returns a flat list of all the Elm files the given
// Elm file depends on, based on the modules it loads via `import`.
function findAllDependencies(file, knownDependencies, baseDir, knownFiles) {
  if (!knownDependencies) {
    knownDependencies = [];
  }

  if (typeof knownFiles === "undefined"){
    knownFiles = [];
  } else if (knownFiles.indexOf(file) > -1){
    return knownDependencies;
  }

  if (baseDir) {
    return findAllDependenciesHelp(file, knownDependencies, baseDir, knownFiles).then(function(thing){
      return thing.knownDependencies;
    });
  } else {
    return getBaseDir(file).then(function(newBaseDir) {
      return findAllDependenciesHelp(file, knownDependencies, newBaseDir, knownFiles).then(function(thing){
        return thing.knownDependencies;
      });
    })
  }
}


function findAllDependenciesHelp(file, knownDependencies, baseDir, knownFiles) {
  return new Promise(function(resolve, reject) {
    // if we already know the file, return known deps since we won't learn anything
    if (knownFiles.indexOf(file) !== -1){
      return resolve({
        file: file,
        error: false,
        knownDependencies: knownDependencies
      });
    }
    // read the imports then parse each of them
    depsLoader.readImports(file).then(function(lines){
        // when lines is null, the file was not read so we just return what we know
        // and flag the error state
        if (lines === null){
          return resolve({
            file: file,
            error: true,
            knownDependencies: knownDependencies
          });
        }

        var newImports = _.compact(lines.map(function(line) {
          var matches = line.match(/^import\s+([^\s]+)/);

          // if the line is not actually an import line
          if (!matches) {
            return null;
          }

          // e.g. Css.Declarations
          var moduleName = matches[1];

          // e.g. Css/Declarations
          var dependencyLogicalName = moduleName.replace(/\./g, "/");

          // all non-native modules are .elm
          var extension = ".elm";
          // all native modules are .js
          if (moduleName.startsWith("Native.")){
            extension = ".js";
          }

          // e.g. ~/code/elm-css/src/Css/Declarations.elm
          var result = path.join(baseDir, dependencyLogicalName + extension);

          return _.includes(knownDependencies, result) ? null : result;

        }));

        knownFiles.push(file);

        var validDependencies = _.flatten(newImports);
        var newDependencies = knownDependencies.concat(validDependencies);
        var recursePromises = _.compact(validDependencies.map(function(dependency) {
          return path.extname(dependency) === ".elm" ?
            findAllDependenciesHelp(dependency, newDependencies, baseDir, knownFiles) : null;
        }));

        Promise.all(recursePromises).then(function(extraDependencies) {
          // keep track of files that weren't found in our src directory
          var externalPackageFiles = [];

          var justDeps = extraDependencies.map(function(thing){
            // if we had an error, we flag the file as a bad thing
            if (thing.error){
              externalPackageFiles.push(thing.file)
              return [];
            }
            return thing.knownDependencies;
          });

          var flat = _.uniq(_.flatten(knownDependencies.concat(justDeps))).filter(function(file){
            return externalPackageFiles.indexOf(file) === -1;
          });

          resolve({
            file: file,
            error: false,
            knownDependencies: flat
          });
        }).catch(reject);
    }).catch(reject);
  });
}

// write compiled Elm to a string output
// returns a Promise which will contain a Buffer of the text
// If you want html instead of js, use options object to set
// output to a html file instead
// creates a temp file and deletes it after reading
function compileToString(sources, options){
  if (typeof options.output === "undefined"){
    options.output = '.js';
  }

  return new Promise(function(resolve, reject){
    temp.open({ suffix: options.output }, function(err, info){
      if (err){
        return reject(err);
      }

      options.output = info.path;
      options.processOpts = { stdio: 'pipe' }

      var compiler = compile(sources, options);

      compiler.stdout.setEncoding("utf8");
      compiler.stderr.setEncoding("utf8");

      var output = '';
      compiler.stdout.on('data', function(chunk) {
        output += chunk;
      });
      compiler.stderr.on('data', function(chunk) {
        output += chunk;
      });

      compiler.on("close", function(exitCode) {
          if (exitCode !== 0) {
            return reject(new Error('Compilation failed\n' + output));
          } else if (options.verbose) {
            console.log(output);
          }

          fs.readFile(info.path, {encoding: "utf8"}, function(err, data){
            return err ? reject(err) : resolve(data);
          });
        });
    });
  });
}

function handleError(pathToMake, err) {
  if (err.code === "ENOENT") {
    console.error("Could not find Elm compiler \"" + pathToMake + "\". Is it installed?")
  } else if (err.code === "EACCES") {
    console.error("Elm compiler \"" + pathToMake + "\" did not have permission to run. Do you need to give it executable permissions?");
  } else {
    console.error("Error attempting to run Elm compiler \"" + pathToMake + "\":\n" + err);
  }
}

function escapePath(pathStr) {
  return pathStr.replace(/ /g, "\\ ");
}

// Converts an object of key/value pairs to an array of arguments suitable
// to be passed to child_process.spawn for elm-make.
function compilerArgsFromOptions(options, emitWarning) {
  return _.flatten(_.map(options, function(value, opt) {
    if (value) {
      switch(opt) {
        case "yes":    return ["--yes"];
        case "help":   return ["--help"];
        case "output": return ["--output", escapePath(value)];
        case "report": return ["--report", value];
        case "warn":   return ["--warn"];
        case "debug":  return ["--debug"];
        default:
          if (supportedOptions.indexOf(opt) === -1) {
            emitWarning('Unknown Elm compiler option: ' + opt);
          }

          return [];
      }
    } else {
      return [];
    }
  }));
}

module.exports = {
  compile: compile,
  compileSync: compileSync,
  compileWorker: require("./worker.js")(compile),
  compileToString: compileToString,
  findAllDependencies: findAllDependencies
};
