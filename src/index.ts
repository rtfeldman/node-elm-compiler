import * as spawn from "cross-spawn";
import * as _ from "lodash"
import * as fs from "fs";
import * as path from "path";
import * as temp from "temp";
import { findAllDependencies } from "find-elm-dependencies";

import { SpawnOptions, ChildProcess } from "child_process";

var elmBinaryName = "elm";

temp.track();


export function compile(sources: string | string[], options: Options): ChildProcess {
  var optionsWithDefaults = prepareOptions(options, options.spawn || spawn);
  var pathToElm = options.pathToElm || elmBinaryName;

  try {
    return runCompiler(sources, optionsWithDefaults, pathToElm)
      .on('error', function (err) { throw (err); });
  } catch (err) {
    throw compilerErrorToString(err, pathToElm);
  }
}

function compileSync(sources: string | string[], options: Options): ChildProcess {
  var optionsWithDefaults = prepareOptions(options, options.spawn || spawn.sync);
  var pathToElm = options.pathToElm || elmBinaryName;

  try {
    return runCompiler(sources, optionsWithDefaults, pathToElm);
  } catch (err) {
    throw compilerErrorToString(err, pathToElm);
  }
}

// write compiled Elm to a string output
// returns a Promise which will contain a Buffer of the text
// If you want html instead of js, use options object to set
// output to a html file instead
// creates a temp file and deletes it after reading
function compileToString(sources: string | string[], options: Options): Promise<string> {
  const suffix = getSuffix(options.output, '.js');

  return new Promise(function (resolve, reject) {
    temp.open({ suffix }, function (err, info) {
      if (err) {
        return reject(err);
      }

      options.output = info.path;
      options.processOpts = { stdio: 'pipe' }

      var compiler;

      try {
        compiler = compile(sources, options);
      } catch (compileError) {
        return reject(compileError);
      }

      compiler.stdout.setEncoding("utf8");
      compiler.stderr.setEncoding("utf8");

      var output = '';
      compiler.stdout.on('data', function (chunk) {
        output += chunk;
      });
      compiler.stderr.on('data', function (chunk) {
        output += chunk;
      });

      compiler.on("close", function (exitCode) {
        if (exitCode !== 0) {
          return reject(new Error('Compilation failed\n' + output));
        } else if (options.verbose) {
          console.log(output);
        }

        fs.readFile(info.path, { encoding: "utf8" }, function (err, data) {
          return err ? reject(err) : resolve(data);
        });
      });
    });
  });
}

function compileToStringSync(sources: string | string[], options: Options): string {
  const suffix = getSuffix(options.output, '.js');

  const file = temp.openSync({ suffix });
  options.output = file.path;
  compileSync(sources, options);

  return fs.readFileSync(file.path, { encoding: "utf8" });
}

export type Options = {
  spawn: typeof spawn,
  runtimeOptions: string[],
  cwd: string,
  pathToElm: string,
  help: boolean,
  output: string,
  report: string,
  debug: boolean,
  verbose: boolean,
  processOpts: SpawnOptions,
  docs: string,
  optimize: boolean,
}

var defaultOptions: Partial<Options> = {
  spawn: spawn,
  runtimeOptions: undefined,
  cwd: undefined,
  pathToElm: undefined,
  help: undefined,
  output: undefined,
  report: undefined,
  debug: undefined,
  verbose: false,
  processOpts: undefined,
  docs: undefined,
  optimize: undefined,
};

var supportedOptions = _.keys(defaultOptions);

function prepareOptions(options: Options, spawnFn: typeof spawn): Options {
  return _.defaults({ spawn: spawnFn }, options, defaultOptions);
}

function runCompiler(sources: string | string[], options: Options, pathToElm: string): ChildProcess {
  if (typeof options.spawn !== "function") {
    throw "options.spawn was a(n) " + (typeof options.spawn) + " instead of a function.";
  }

  var processArgs = prepareProcessArgs(sources, options);
  var processOpts = prepareProcessOpts(options);

  if (options.verbose) {
    console.log(["Running", pathToElm].concat(processArgs).join(" "));
  }

  return options.spawn(pathToElm, processArgs, processOpts);
}

function prepareProcessArgs(sources: string | string[], options: Options): string[] {
  var preparedSources = prepareSources(sources);
  var compilerArgs = compilerArgsFromOptions(options);

  return ["make"].concat(preparedSources ? preparedSources.concat(compilerArgs) : compilerArgs);
}

function prepareSources(sources: string | string[]): string[] {
  if (!(sources instanceof Array || typeof sources === "string")) {
    throw "compile() received neither an Array nor a String for its sources argument.";
  }

  return typeof sources === "string" ? [sources] : sources;
}

function prepareProcessOpts(options: Options): SpawnOptions {
  var env = _.merge({ LANG: 'en_US.UTF-8' }, process.env);
  return _.merge({ env: env, stdio: "inherit", cwd: options.cwd }, options.processOpts);

}

function compilerErrorToString(err: { code?: string, message?: string }, pathToElm: string): string {
  if ((typeof err === "object") && (typeof err.code === "string")) {
    switch (err.code) {
      case "ENOENT":
        return "Could not find Elm compiler \"" + pathToElm + "\". Is it installed?";

      case "EACCES":
        return "Elm compiler \"" + pathToElm + "\" did not have permission to run. Do you need to give it executable permissions?";

      default:
        return "Error attempting to run Elm compiler \"" + pathToElm + "\":\n" + err;
    }
  } else if ((typeof err === "object") && (typeof err.message === "string")) {
    return JSON.stringify(err.message);
  } else {
    return "Exception thrown when attempting to run Elm compiler " + JSON.stringify(pathToElm);
  }
}

function getSuffix(outputPath: string | undefined, defaultSuffix: string): string {
  if (outputPath) {
    return path.extname(outputPath) || defaultSuffix;
  } else {
    return defaultSuffix;
  }
}

// Converts an object of key/value pairs to an array of arguments suitable
// to be passed to child_process.spawn for elm-make.
function compilerArgsFromOptions(options: Options): string[] {
  return _.flatten(_.map(options, function (value, opt): string[] {
    if (value) {
      switch (opt) {
        case "help": return ["--help"];
        case "output": return ["--output", (value as string)];
        case "report": return ["--report", (value as string)];
        case "debug": return ["--debug"];
        case "docs": return ["--docs", (value as string)];
        case "optimize": return ["--optimize"];
        case "runtimeOptions": return _.concat(["+RTS"], (value as string), ["-RTS"]);
        default:
          if (supportedOptions.indexOf(opt) === -1) {
            if (opt === "yes") {
              throw new Error('node-elm-compiler received the `yes` option, but that was removed in Elm 0.19. Try re-running without passing the `yes` option.');
            } else if (opt === "warn") {
              throw new Error('node-elm-compiler received the `warn` option, but that was removed in Elm 0.19. Try re-running without passing the `warn` option.');
            } else if (opt === "pathToMake") {
              throw new Error('node-elm-compiler received the `pathToMake` option, but that was renamed to `pathToElm` in Elm 0.19. Try re-running after renaming the parameter to `pathToElm`.');
            } else {
              throw new Error('node-elm-compiler was given an unrecognized Elm compiler option: ' + opt);
            }
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
  compileWorker: require("./worker")(compile),
  compileToString: compileToString,
  compileToStringSync: compileToStringSync,
  findAllDependencies: findAllDependencies,
  _prepareProcessArgs: prepareProcessArgs
};
