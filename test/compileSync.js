var chai = require("chai")
var path = require("path");
var compiler = require(path.join(__dirname, ".."));

var expect = chai.expect;

var fixturesDir = path.join(__dirname, "fixtures");

function prependFixturesDir(filename) {
  return path.join(fixturesDir, filename);
}

describe("#compileSync", function() {
  // Use a timeout of 5 minutes because Travis on Linux can be SUPER slow.
  this.timeout(300000);

  it("works with --yes", function () {
    var opts = {yes: true, output: "/dev/null", verbose: true, cwd: fixturesDir};
    var compileProcess = compiler.compileSync(prependFixturesDir("Parent.elm"), opts);

    expect(compileProcess.status, "Expected elm-make to have exit code 0").to.equal(0);
  });

  it("reports errors on bad source", function () {
    var opts = {
      yes: true,
      verbose: true,
      cwd: fixturesDir
    };
    var compileProcess = compiler.compileSync(prependFixturesDir("Bad.elm"), opts);

    var exitCode = compileProcess.status;
    var desc = "Expected elm-make to have exit code 1";
    expect(exitCode, desc).to.equal(1);
  });

  it("invokes custom `emitWarning`", function () {
    var opts = {
      foo: "bar",
      emitWarning: chai.spy(),
      yes: true,
      output: "/dev/null",
      verbose: true,
      cwd: fixturesDir
    };
    var compileProcess = compiler.compileSync(prependFixturesDir("Parent.elm"), opts);

    var desc = "Expected emitWarning to have been called";
    expect(opts.emitWarning, desc).to.have.been.called();
  });
});
