import { SpawnOptions } from "child_process";
import * as _ from "lodash";

/**
 * Transforms our CLI options into a form suitable for spawning a process.
 * @param sources Path(s) to the files to compile.
 * @param options CLI input options.
 * @returns Options suitable for spawning a process.
 */
export function processOptions(sources: string | string[], options: Options): ProcessedOptions {
    return {
        command: getPathToElm(options.pathToElm),
        args: getElmArgs(sources, options),
        options: getProcessOpts(options.cwd, options.processOpts),
        verbose: options.verbose || false,
    };
}

/**
 * All options our CLI accepts.
 * 
 * For backwards compatibility, we merge the CLI options and Elm compiler arguments.
 */
export type Options = CliOptions & ElmArgs

/**
 * Our CLI-specific options.
 */
interface CliOptions {
    pathToElm?: string,
    cwd?: string,
    processOpts?: SpawnOptions
    verbose?: boolean,
}

/**
 * Arguments for the elm compiler.
 */
interface ElmArgs {
    output?: string,
    optimize?: boolean,
    debug?: boolean,
    report?: string,
    docs?: string,
    help?: boolean,
    runtimeOptions?: string[],
}

/**
 * Arguments for spawning the process.
 */
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