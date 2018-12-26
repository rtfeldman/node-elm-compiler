var chai = require("chai")
var path = require("path");
var compiler = require(path.join(__dirname, "../src"));
var childProcess = require("child_process");
var _ = require("lodash");
var temp = require("temp");

var expect = chai.expect;

var fixturesDir = path.join(__dirname, "fixtures");

function prependFixturesDir(filename) {
  return path.join(fixturesDir, filename);
}

describe("#compile", function () {
  // Use a timeout of 5 minutes because Travis on Linux can be SUPER slow.
  this.timeout(300000);

  it("reports errors on bad source", function (done) {
    var opts = {
      verbose: true,
      cwd: fixturesDir
    };
    var compileProcess = compiler.compile(prependFixturesDir("Bad.elm"), opts);

    compileProcess.on("exit", function (exitCode) {
      var desc = "Expected elm make to have exit code 1";
      expect(exitCode, desc).to.equal(1);
      done();
    });
  });

  it("throws when given an unrecognized argument", function () {
    var opts = {
      foo: "bar",
      output: "/dev/null",
      verbose: true,
      cwd: fixturesDir
    };

    expect(function () {
      var compileProcess = compiler.compile(prependFixturesDir("Parent.elm"), opts);

    }).to.throw();
  });
});

describe("#compileToString", function () {
  // Use an epic timeout because Travis on Linux can be SUPER slow.
  this.timeout(600000);

  it("adds runtime options as arguments", function () {
    var opts = {
      verbose: true,
      cwd: fixturesDir,
      runtimeOptions: ["-A128M", "-H128M", "-n8m"]
    };

    return expect(compiler
      ._prepareProcessArgs("a.elm", opts)
      .join(" ")).to.equal("make a.elm +RTS -A128M -H128M -n8m -RTS");
  });

  it("reports errors on bad syntax", function () {
    var opts = {
      verbose: true,
      cwd: fixturesDir
    };
    var compilePromise = compiler.compileToString(prependFixturesDir("Bad.elm"), opts);

    return compilePromise.catch(function (err) {
      expect(err).to.be.an('error');
      expect(String(err))
        .to.contain("Compilation failed")
        .and.contain("PARSE ERROR");
    });
  });

  it("reports type errors", function () {
    var opts = {
      verbose: true,
      cwd: fixturesDir
    };
    var compilePromise = compiler.compileToString(prependFixturesDir("TypeError.elm"), opts);

    return compilePromise.catch(function (err) {
      expect(err).to.be.an('error');
      expect(String(err))
        .to.contain("Compilation failed")
        .and.contain("TYPE MISMATCH");
    });
  });

  it("Rejects the Promise when given an unrecognized argument like `yes`", function () {
    var opts = {
      foo: "bar",
      verbose: true,
      cwd: fixturesDir
    };

    var compilePromise = compiler.compileToString(prependFixturesDir("Parent.elm"), opts);

    return new Promise(function (resolve, reject) {
      return compilePromise.then(function () {
        reject("Expected the compilation promise to be rejected due to the unrecognized compiler argument.");
      }).catch(function () {
        resolve();
      });
    });
  });


  it("works when run multiple times", function () {
    var opts = {
      verbose: true,
      cwd: fixturesDir
    };

    var runCompile = function () {
      var compilePromise = compiler.compileToString(prependFixturesDir("Parent.elm"), opts)

      return compilePromise.then(function (result) {
        var desc = "Expected elm make to return the result of the compilation";
        expect(result.toString(), desc).to.be.a('string');
      });
    };

    // Compiling in parallel leads to issues with the cache. Therefore we chain
    // the compilations instead. For details, see https://github.com/elm/compiler/issues/1853.
    // This issue is tracked as https://github.com/rtfeldman/node-elm-compiler/issues/86.
    let promiseChain = Promise.resolve();
    for (var i = 0; i < 10; i++) {
      promiseChain = promiseChain.then(() => runCompile());
    }
    return promiseChain;
  });
});

describe("#compileWorker", function () {
  // Use a timeout of 5 minutes because Travis on Linux can be SUPER slow.
  this.timeout(300000);

  it("works with BasicWorker.elm", function () {
    var opts = {
      verbose: true,
      cwd: fixturesDir
    };
    var compilePromise = compiler.compileWorker(
      prependFixturesDir(""),
      prependFixturesDir("BasicWorker.elm"),
      "BasicWorker"
    );

    return compilePromise.then(function (app) {
      app.ports.reportFromWorker.subscribe(function (str) {
        expect(str).to.equal("it's alive!");
      });
    })
  });
});
