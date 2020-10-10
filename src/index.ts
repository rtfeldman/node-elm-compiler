import * as spawn from "cross-spawn";
import * as _ from "lodash"
import { ChildProcess, SpawnSyncReturns } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as temp from "temp";

import { processOptions, ProcessedOptions, Options } from "./options"

export { compileWorker } from "./worker";
// Let's ignore that the following dependency does not have types.
//@ts-ignore
export { findAllDependencies } from "find-elm-dependencies";

export { processOptions, ProcessedOptions, Options };

// Track temp files, so that they will be automatically deleted on process exit.
// See https://github.com/bruce/node-temp#want-cleanup-make-sure-you-ask-for-it
temp.track();

export function compile(sources: string | string[], rawOptions: Options): ChildProcess {
  const processed = processOptions(sources, rawOptions);

  try {
    logCommand(processed);
    return spawn(processed.command, processed.args, processed.options)
      .on('error', function (err) { throw (err); });
  } catch (err) {
    throw new Error(compilerErrorToString(err, processed.command));
  }
}

export function compileSync(sources: string | string[], options: Options): SpawnSyncReturns<Buffer> {
  const processed = processOptions(sources, options);

  try {
    logCommand(processed);
    return spawn.sync(processed.command, processed.args, processed.options)
  } catch (err) {
    throw new Error(compilerErrorToString(err, processed.command));
  }
}

function logCommand(processed: ProcessedOptions) {
  if (processed.verbose) {
    console.log(["Running", processed.command, ...processed.args].join(" "));
  }
}

export function compileToString(sources: string | string[], options: Options): Promise<string> {
  const suffix = getSuffix(options.output, '.js');

  return new Promise(function (resolve, reject) {
    temp.open({ suffix }, function (err, info) {
      if (err) {
        return reject(err);
      }

      options.output = info.path;
      options.processOpts = { stdio: 'pipe' }

      let compiler;

      try {
        compiler = compile(sources, options);
      } catch (compileError) {
        return reject(compileError);
      }

      compiler.stdout.setEncoding("utf8");
      compiler.stderr.setEncoding("utf8");

      let output = '';
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

export function compileToStringSync(sources: string | string[], options: Options): string {
  const suffix = getSuffix(options.output, '.js');

  const file = temp.openSync({ suffix });
  options.output = file.path;

  compileSync(sources, options);

  return fs.readFileSync(file.path, { encoding: "utf8" });
}

function getSuffix(outputPath: string | undefined, defaultSuffix: string): string {
  if (outputPath) {
    return path.extname(outputPath) || defaultSuffix;
  } else {
    return defaultSuffix;
  }
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
