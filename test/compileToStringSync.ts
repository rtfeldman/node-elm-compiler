var chai = require("chai");
var path = require("path");
var compiler = require(path.join(__dirname, ".."));

var expect = chai.expect;

var fixturesDir = path.join(__dirname, "fixtures");

function prependFixturesDir(filename) {
  return path.join(fixturesDir, filename);
}

describe("#compileToStringSync", function () {
  it('returns string JS output of the given elm file', function () {
    var opts = { verbose: true, cwd: fixturesDir };
    var result = compiler.compileToStringSync(prependFixturesDir("Parent.elm"), opts);

    expect(result).to.include("_Platform_export");
  });

  it('returns html output given "html" output option', function () {
    var opts = {
      verbose: true,
      cwd: fixturesDir,
      output: prependFixturesDir('compiled.html'),
    };
    var result = compiler.compileToStringSync(prependFixturesDir("Parent.elm"), opts);

    expect(result).to.include('<!DOCTYPE HTML>');
    expect(result).to.include('<title>Parent</title>');
    expect(result).to.include("_Platform_export");
  });
});
