var assert = require("chai").assert;
var path = require("path");
var compiler = require(path.join(__dirname, ".."));
var childProcess = require("child_process");
var _ = require("lodash");

var fixturesDir = path.join(__dirname, "fixtures");

function prependFixturesDir(filename) {
  return path.join(fixturesDir, filename);
}

describe("#compile", function() {
  // Use a timeout of 5 minutes because Travis on Linux can be SUPER slow.
  this.timeout(300000);

  it("works with --yes", function (done) {
    var opts = {yes: true, output: "/dev/null", verbose: true, cwd: fixturesDir};
    var compileProcess = compiler.compile(prependFixturesDir("Parent.elm"), opts);

    compileProcess.on("exit", function(exitCode) {
      assert.equal(exitCode, 0, "Expected elm-make to have exit code 0");
      done();
    });
  });

  it("reports errors on bad source", function (done) {
    var opts = {yes: true, verbose: true, cwd: fixturesDir};
    var compileProcess = compiler.compile(prependFixturesDir("Bad.elm"), opts);

    compileProcess.on("exit", function(exitCode) {
      assert.equal(exitCode, 1, "Expected elm-make to have exit code 1");
      done();
    });
  });
});

describe("#compileToString", function() {
  // Use a timeout of 5 minutes because Travis on Linux can be SUPER slow.
  this.timeout(300000);

  it("works with --yes", function (done) {
    var opts = {yes: true, verbose: true, cwd: fixturesDir};
    var compilePromise = compiler.compileToString(prependFixturesDir("Parent.elm"), opts);

    compilePromise.then(function(result) {
      assert.isString(result.toString(), "Expected elm-make to return the result of the compilation");
      done();
    });
  });

  it("reports errors on bad source", function (done) {
    var opts = {yes: true, verbose: true, cwd: fixturesDir};
    var compilePromise = compiler.compileToString(prependFixturesDir("Bad.elm"), opts);

    compilePromise.catch(function(err) {
      assert.equal(err, "Compiler process exited with code 1", "Expected elm-make to have exit code 1");
      done();
    });
  });
});
