var chai = require("chai")
var spies = require("chai-spies");
var path = require("path");
var compiler = require(path.join(__dirname, ".."));
var childProcess = require("child_process");
var _ = require("lodash");

chai.use(spies);

var expect = chai.expect;

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
      expect(exitCode, "Expected elm-make to have exit code 0").to.equal(0);
      done();
    });
  });

  it("reports errors on bad source", function (done) {
    var opts = {
      yes: true,
      verbose: true,
      cwd: fixturesDir
    };
    var compileProcess = compiler.compile(prependFixturesDir("Bad.elm"), opts);

    compileProcess.on("exit", function(exitCode) {
      var desc = "Expected elm-make to have exit code 1";
      expect(exitCode, desc).to.equal(1);
      done();
    });
  });

  it("invokes custom `emitWarning`", function (done) {
    var opts = {
      foo: "bar",
      emitWarning: chai.spy(),
      yes: true,
      output: "/dev/null",
      verbose: true,
      cwd: fixturesDir
    };
    var compileProcess = compiler.compile(prependFixturesDir("Parent.elm"), opts);

    compileProcess.on("exit", function(exitCode) {
      var desc = "Expected emitWarning to have been called";
      expect(opts.emitWarning, desc).to.have.been.called();
      done();
    });
  });
});

describe("#compileToString", function() {
  // Use a timeout of 5 minutes because Travis on Linux can be SUPER slow.
  this.timeout(300000);

  it("works with --yes", function () {
    var opts = {
      yes: true,
      verbose: true,
      cwd: fixturesDir
    };
    var compilePromise = compiler.compileToString(prependFixturesDir("Parent.elm"), opts);

    return compilePromise.then(function(result) {
      var desc = "Expected elm-make to return the result of the compilation";
      expect(result.toString(), desc).to.be.a('string');
    });
  });

  it("reports errors on bad syntax", function () {
    var opts = {
      yes: true,
      verbose: true,
      cwd: fixturesDir
    };
    var compilePromise = compiler.compileToString(prependFixturesDir("Bad.elm"), opts);

    return compilePromise.catch(function(err) {
      expect(err).to.be.an('error');
      expect(String(err))
        .to.contain("Compilation failed")
        .and.contain("SYNTAX PROBLEM");
    });
  });

  it("reports type errors", function () {
    var opts = {
      yes: true,
      verbose: true,
      cwd: fixturesDir
    };
    var compilePromise = compiler.compileToString(prependFixturesDir("TypeError.elm"), opts);

    return compilePromise.catch(function(err) {
      expect(err).to.be.an('error');
      expect(String(err))
        .to.contain("Compilation failed")
        .and.contain("TYPE MISMATCH");
    });
  });

  it("invokes custom `emitWarning`", function () {
    var opts = {
      foo: "bar",
      emitWarning: chai.spy(),
      yes: true,
      verbose: true,
      cwd: fixturesDir
    };
    var compilePromise = compiler.compileToString(prependFixturesDir("Parent.elm"), opts);

    return compilePromise.then(function(err) {
      var desc = "Expected emitWarning to have been called";
      expect(opts.emitWarning, desc).to.have.been.called();
    });
  });
});

describe("#compileWorker", function() {
  // Use a timeout of 5 minutes because Travis on Linux can be SUPER slow.
  this.timeout(300000);

  it("works with BasicWorker.elm", function() {
    var opts = {
      yes: true,
      verbose: true,
      cwd: fixturesDir
    };
    var compilePromise = compiler.compileWorker(
      prependFixturesDir(""),
      prependFixturesDir("BasicWorker.elm"),
      "BasicWorker"
    );

    return compilePromise.then(function(app) {
      app.ports.report.subscribe(function(str) {
        expect(str).to.equal("it's alive!");
      });
    })
  });
});
