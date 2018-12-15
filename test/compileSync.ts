var chai = require("chai")
var path = require("path");
var compiler = require(path.join(__dirname, "../src"));

var expect = chai.expect;

var fixturesDir = path.join(__dirname, "fixtures");

function prependFixturesDir(filename) {
  return path.join(fixturesDir, filename);
}

describe("#compileSync", function () {
  // Use a timeout of 5 minutes because Travis on Linux can be SUPER slow.
  this.timeout(300000);

  it("succeeds on SimplestMain", function () {
    var opts = {
      verbose: true,
      cwd: fixturesDir
    };
    var compileProcess = compiler.compileSync(prependFixturesDir("SimplestMain.elm"), opts);

    var exitCode = compileProcess.status;
    var desc = "Expected elm make to have exit code 0";
    expect(exitCode, desc).to.equal(0);
  });

  it("reports errors on bad source", function () {
    var opts = {
      verbose: true,
      cwd: fixturesDir
    };
    var compileProcess = compiler.compileSync(prependFixturesDir("Bad.elm"), opts);

    var exitCode = compileProcess.status;
    var desc = "Expected elm make to have exit code 1";
    expect(exitCode, desc).to.equal(1);
  });

  it("throws when given an unrecognized argument like `yes`", function () {
    var opts = {
      yes: true,
      output: "/dev/null",
      verbose: true,
      cwd: fixturesDir
    };

    expect(function () {
      var compileProcess = compiler.compileSync(prependFixturesDir("Parent.elm"), opts);
    }).to.throw();
  });
});
