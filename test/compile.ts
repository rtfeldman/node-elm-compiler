import * as chai from "chai";
import * as path from "path";
import * as _ from "lodash";

import * as compiler from "../src"

const expect = chai.expect;

const fixturesDir = path.join(__dirname, "fixtures");

function prependFixturesDir(filename: string) {
  return path.join(fixturesDir, filename);
}

describe("#compile", function () {
  // Use a timeout of 5 minutes because Travis on Linux can be SUPER slow.
  this.timeout(300000);

  it("reports errors on bad source", function (done) {
    const opts = {
      verbose: true,
      cwd: fixturesDir
    };
    const compileProcess = compiler.compile(prependFixturesDir("Bad.elm"), opts);

    compileProcess.on("exit", function (exitCode: number) {
      const desc = "Expected elm make to have exit code 1";
      expect(exitCode, desc).to.equal(1);
      done();
    });
  });
});

describe("#compileToString", function () {
  // Use an epic timeout because Travis on Linux can be SUPER slow.
  this.timeout(600000);

  it("reports errors on bad syntax", function () {
    const opts = {
      verbose: true,
      cwd: fixturesDir
    };
    const compilePromise = compiler.compileToString(prependFixturesDir("Bad.elm"), opts);

    return compilePromise.catch(function (err: Error) {
      expect(err).to.be.an('error');
      expect(String(err))
        .to.contain("Compilation failed")
        .and.contain("MISSING EXPRESSION");
    });
  });

  it("reports type errors", function () {
    const opts = {
      verbose: true,
      cwd: fixturesDir
    };
    const compilePromise = compiler.compileToString(prependFixturesDir("TypeError.elm"), opts);

    return compilePromise.catch(function (err: Error) {
      expect(err).to.be.an('error');
      expect(String(err))
        .to.contain("Compilation failed")
        .and.contain("TYPE MISMATCH");
    });
  });

  it("works when run multiple times", function () {
    const opts = {
      verbose: true,
      cwd: fixturesDir
    };

    const runCompile = function () {
      const compilePromise = compiler.compileToString(prependFixturesDir("Parent.elm"), opts)

      return compilePromise.then(function (result: string) {
        const desc = "Expected elm make to return the result of the compilation";
        expect(result.toString(), desc).to.be.a('string');
      });
    };

    // Compiling in parallel leads to issues with the cache. Therefore we chain
    // the compilations instead. For details, see https://github.com/elm/compiler/issues/1853.
    // This issue is tracked as https://github.com/rtfeldman/node-elm-compiler/issues/86.
    let promiseChain = Promise.resolve();
    for (let i = 0; i < 10; i++) {
      promiseChain = promiseChain.then(() => runCompile());
    }
    return promiseChain;
  });

  it("handles output suffix correctly", function () {
    const opts = {
      verbose: true,
      cwd: fixturesDir,
      output: prependFixturesDir("compiled.html"),
    };

    return compiler.compileToString(prependFixturesDir("Parent.elm"), opts)
      .then(function (result: string) {
        const desc = "Expected elm make to return the result of the compilation";
        expect(result.toString(), desc).to.be.a('string');
      });
  });
});

describe("#compileSync", function () {
  // Use a timeout of 5 minutes because Travis on Linux can be SUPER slow.
  this.timeout(300000);

  it("succeeds on SimplestMain", function () {
    const opts = {
      verbose: true,
      cwd: fixturesDir
    };
    const compileProcess = compiler.compileSync(prependFixturesDir("SimplestMain.elm"), opts) as any;

    const exitCode = compileProcess.status;
    const desc = "Expected elm make to have exit code 0";
    expect(exitCode, desc).to.equal(0);
  });

  it("reports errors on bad source", function () {
    const opts = {
      verbose: true,
      cwd: fixturesDir
    };
    const compileProcess = compiler.compileSync(prependFixturesDir("Bad.elm"), opts) as any;

    const exitCode = compileProcess.status;
    const desc = "Expected elm make to have exit code 1";
    expect(exitCode, desc).to.equal(1);
  });
});

describe("#compileToStringSync", function () {
  it('returns string JS output of the given elm file', function () {
    const opts = { verbose: true, cwd: fixturesDir };
    const result = compiler.compileToStringSync(prependFixturesDir("Parent.elm"), opts);

    expect(result).to.include("_Platform_export");
  });

  it('returns html output given "html" output option', function () {
    const opts = {
      verbose: true,
      cwd: fixturesDir,
      output: prependFixturesDir('compiled.html'),
    };
    const result = compiler.compileToStringSync(prependFixturesDir("Parent.elm"), opts);

    expect(result).to.include('<!DOCTYPE HTML>');
    expect(result).to.include('<title>Parent</title>');
    expect(result).to.include("_Platform_export");
  });
});

describe("#compileWorker", function () {
  // Use a timeout of 5 minutes because Travis on Linux can be SUPER slow.
  this.timeout(300000);

  it("works with BasicWorker.elm", function () {
    const opts = {
      verbose: true,
      cwd: fixturesDir
    };
    const compilePromise = compiler.compileWorker(
      prependFixturesDir(""),
      prependFixturesDir("BasicWorker.elm"),
    );

    return compilePromise.then(function (app: any) {
      app.ports.reportFromWorker.subscribe(function (str: string) {
        expect(str).to.equal("it's alive!");
      });
    })
  });

  it("accepts arguments", function () {
    const opts = {
      verbose: true,
      cwd: fixturesDir
    };
    const compilePromise = compiler.compileWorker(
      prependFixturesDir(""),
      prependFixturesDir("EchoWorker.elm"),
      "echo"
    );

    return compilePromise.then(function (app: any) {
      app.ports.reportFromWorker.subscribe(function (str: string) {
        expect(str).to.equal("You said: echo");
      });
    })
  });
});
