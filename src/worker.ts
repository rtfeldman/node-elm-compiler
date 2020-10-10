import * as temp from "temp";
import * as path from "path";

import { compile } from './index';
import { Options } from "./options"

// Track temp files, so that they will be automatically deleted on process exit.
// See https://github.com/bruce/node-temp#want-cleanup-make-sure-you-ask-for-it
temp.track();

type Path = string;

const jsEmitterFilename = "emitter.js";

export async function compileWorker(
  projectRootDir: Path,
  modulePath: Path,
  moduleName: string,
  workerArgs?: { flags: any },
): Promise<ElmWorker> {
  const originalWorkingDir = process.cwd();
  process.chdir(projectRootDir);

  try {
    const tmpDirPath = await createTmpDir();
    const dest = path.join(tmpDirPath, jsEmitterFilename);

    await compileAsync(modulePath, { output: dest });
    const worker = await runWorker(dest, moduleName, workerArgs?.flags);

    return worker;
  } catch (err) {
    throw Error(err);
  } finally {
    process.chdir(originalWorkingDir);
  }
}

function createTmpDir(): Promise<string> {
  return new Promise(function (resolve, reject) {
    temp.mkdir("node-elm-compiler", function (err, tmpDirPath) {
      if (err) {
        reject(err);
      } else {
        resolve(tmpDirPath);
      }
    });
  });
}

function compileAsync(src: string, options: Partial<Options>): Promise<number> {
  return new Promise(function (resolve, reject) {
    compile(src, options)
      .on("close", function (exitCode) {
        if (exitCode === 0) {
          resolve(exitCode);
        } else {
          reject("Errored with exit code " + exitCode);
        }
      })
  });
}

type ElmWorker = object;

async function runWorker(
  jsFilename: string,
  moduleName: string,
  flags?: any,
): Promise<ElmWorker> {
  const elmFile = await import(jsFilename);
  const Elm = elmFile.Elm;

  if (!(moduleName in Elm)) {
    throw missingEntryModuleMessage(moduleName, Elm);
  }

  const worker = Elm[moduleName].init({ flags });

  if (Object.keys(worker.ports).length === 0) {
    throw noPortsMessage(moduleName);
  }

  return worker;
}

function missingEntryModuleMessage(moduleName: string, Elm: ElmWorker): string {
  let errorMessage = "I couldn't find the entry module " + moduleName + ".\n";
  const suggestions = suggestModulesNames(Elm);

  if (suggestions.length > 1) {
    errorMessage += "\nMaybe you meant one of these: " + suggestions.join(",");
  } else if (suggestions.length === 1) {
    errorMessage += "\nMaybe you meant: " + suggestions;
  }

  errorMessage += "\nYou can pass me a different module to use with --module=<moduleName>";

  return errorMessage;
}

function suggestModulesNames(Elm: ElmWorker): string[] {
  return Object.keys(Elm).filter(function (key) {
    return KNOWN_MODULES.indexOf(key) === -1;
  })
}

const KNOWN_MODULES =
  [
    "fullscreen",
    "embed",
    "worker",
    "Basics",
    "Maybe",
    "List",
    "Array",
    "Char",
    "Color",
    "Transform2D",
    "Text",
    "Graphics",
    "Debug",
    "Result",
    "Task",
    "Signal",
    "String",
    "Dict",
    "Json",
    "Regex",
    "VirtualDom",
    "Html",
    "Css"
  ];

function noPortsMessage(moduleName: string): string {
  let errorMessage = "The module " + moduleName + " doesn't expose any ports!\n";

  errorMessage += "\n\nTry adding something like";
  errorMessage += "port foo : Value\nport foo =\n    someValue\n\nto " + moduleName + "!";

  return errorMessage.trim();
}
