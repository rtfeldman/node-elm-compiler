var assert = require("chai").assert;
var path = require("path");
var compiler = require(path.join(__dirname, ".."));
var childProcess = require("child_process");
var _ = require("lodash");

var fixturesDir = path.join(__dirname, "fixtures");

function prependFixturesDir(filename) {
  return path.join(fixturesDir, filename);
}

function spawnForFixtures(pathToMake, processArgs, processOpts) {
  var opts = _.defaults({cwd: fixturesDir}, processOpts);

  return childProcess.spawn(pathToMake, processArgs, opts);
}

describe("#compile", function() {
  it("works with --yes", function (done) {
    // Use a timeout of 60 seconds because we need to download packages.
    // (Had 30 seconds before and it timed out on Travis Linux.)
    this.timeout(60000);

    var opts = {yes: true, output: "/dev/null", verbose: true, spawn: spawnForFixtures};
    var compileProcess = compiler.compile(prependFixturesDir("Parent.elm"), opts);

    compileProcess.on("close", function(exitCode) {
      assert.equal(exitCode, 0, "Expected elm-make to have exit code 0");
      done();
    });
  });
});
