import { SpawnOptions } from "child_process";
import * as _ from "lodash";

export function processOptions(sources: string | string[], options: Options): ProcessedOptions {
    return {
        command: getPathToElm(options.pathToElm),
        args: getElmArgs(sources, options),
        options: getProcessOpts(options.cwd, options.processOpts),
        verbose: options.verbose || false,
    };
}

export type Options = CliOptions & ElmArgs

interface CliOptions {
    pathToElm?: string,
    cwd?: string,
    processOpts?: SpawnOptions
    verbose?: boolean,
}

interface ElmArgs {
    output?: string,
    optimize?: boolean,
    debug?: boolean,
    report?: string,
    docs?: string,
    help?: boolean,
    runtimeOptions?: string[],
}

export type ProcessedOptions = {
    command: string,
    args: string[],
    options: SpawnOptions,
    verbose: boolean
};

const elmBinaryName = "elm";

function getPathToElm(rawPath?: string): string {
    return rawPath || elmBinaryName;
}

function getElmArgs(rawSources: string | string[], rawArgs: ElmArgs): string[] {
    const sources = getSources(rawSources);
    const args = getArgs(rawArgs);

    return ["make", ...sources, ...args];
}

function getSources(rawSources: string | string[]): string[] {
    // Removed exception when `sources` has unexpected type.

    return typeof rawSources === "string" ? [rawSources] : rawSources;
}

function getArgs(rawArgs: ElmArgs): string[] {
    // Removed exception when extra, i.e. unsupported, arguments were present.

    let args = [];
    if (rawArgs.help) {
        args.push("--help");
    }
    if (rawArgs.output) {
        args = args.concat(["--output", rawArgs.output]);
    }
    if (rawArgs.report) {
        args = args.concat(["--report", rawArgs.report]);
    }
    if (rawArgs.debug) {
        args.push("--debug");
    }
    if (rawArgs.docs) {
        args = args.concat(["--docs", rawArgs.docs]);
    }
    if (rawArgs.optimize) {
        args.push("--optimize")
    }
    if (rawArgs.runtimeOptions) {
        args = args.concat(["+RTS", ...rawArgs.runtimeOptions, "-RTS"])
    }

    return args;
}

function getProcessOpts(cwd?: string, processOpts?: SpawnOptions): SpawnOptions {
    const env = _.merge({ LANG: 'en_US.UTF-8' }, process.env);
    return _.merge({ env: env, stdio: "inherit", cwd: cwd }, processOpts);
}