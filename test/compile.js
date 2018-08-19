var chai = require("chai")
var spies = require("chai-spies");
var path = require("path");
var compiler = require(path.join(__dirname, ".."));
var childProcess = require("child_process");
var _ = require("lodash");
var temp = require("temp");

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
  // Use an epic timeout because Travis on Linux can be SUPER slow.
  this.timeout(600000);

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

  it("adds runtime options as arguments", function () {
    var opts = {
      yes: true,
      verbose: true,
      cwd: fixturesDir,
      runtimeOptions: ["-A128M", "-H128M", "-n8m"]
    };

    return expect(compiler
        ._prepareProcessArgs("a.elm", opts)
        .join(" ")).to.equal("a.elm --yes +RTS -A128M -H128M -n8m -RTS");
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


  it("works when run multiple times", function () {
    var opts = {
      yes: true,
      verbose: true,
      cwd: fixturesDir
    };

    var runCompile = function() {
      // running compileToString right after each other can cause raceconditions
      // the problem is that temp.cleanupSync removes all tempfiles
      compiler.compileToString(prependFixturesDir("Parent.elm"), opts)
      var compilePromise = compiler.compileToString(prependFixturesDir("Parent.elm"), opts)

      return compilePromise.then(function(result) {
        var desc = "Expected elm-make to return the result of the compilation";
        expect(result.toString(), desc).to.be.a('string');
      });
    };
    var promises = [];
    for (var i = 0; i < 10; i++) {
      promises.push(runCompile());
    }
    return Promise.all(promises);
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
