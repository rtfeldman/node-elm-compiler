import * as chai from "chai";
import * as path from "path";

import * as compiler from "../src";

const expect = chai.expect;

const fixturesDir = path.join(__dirname, "fixtures");

function prependFixturesDir(filename) {
  return path.join(fixturesDir, filename);
}

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

  it("throws when given an unrecognized argument like `yes`", function () {
    const opts = {
      yes: true,
      output: "/dev/null",
      verbose: true,
      cwd: fixturesDir
    };

    expect(function () {
      const compileProcess = compiler.compileSync(prependFixturesDir("Parent.elm"), opts);
    }).to.throw();
  });
});
