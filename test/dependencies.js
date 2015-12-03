var assert = require("chai").assert;
var path = require("path");
var compiler = require(path.join(__dirname, ".."));

var fixturesDir = path.join(__dirname, "fixtures");

function prependFixturesDir(filename) {
  return path.join(fixturesDir, filename);
}

describe("#findAllDependencies", function() {
  it("works for a file with three dependencies", function () {
    return compiler.findAllDependencies(prependFixturesDir("Parent.elm")).then(function(results) {
      assert.deepEqual(
        results,
        [ "ChildA.elm", "ChildB.elm", "NativeChild.js" ].map(prependFixturesDir)
      );
    });
  });
});
