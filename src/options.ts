import { SpawnOptions } from "child_process";
import * as _ from "lodash";

export function processOptions(options: Options): ProcessedOptions {
    return {
        pathToElm: getPathToElm(options.pathToElm),
        processOpts: getProcessOpts(options.cwd, options.processOpts),
    };
}

export type Options = {
    pathToElm?: string,
    cwd?: string,
    processOpts?: SpawnOptions
}

export type ProcessedOptions = {
    pathToElm: string,
    processOpts: SpawnOptions
};

const elmBinaryName = "elm";

function getPathToElm(pathToElm?: string): string {
    return pathToElm || elmBinaryName;
}

function getProcessOpts(cwd?: string, processOpts?: SpawnOptions): SpawnOptions {
    const env = _.merge({ LANG: 'en_US.UTF-8' }, process.env);
    return _.merge({ env: env, stdio: "inherit", cwd: cwd }, processOpts);
}