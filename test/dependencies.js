var expect = require("chai").expect;
var path = require("path");
var compiler = require(path.join(__dirname, ".."));

function prependDir(fixtureDir) {
  return function(filename) {
    var fixturesDir = path.join(__dirname, fixtureDir);
    return path.join(fixturesDir, filename);
  }
}

var prependFixturesDir = prependDir("fixtures");
var prependMoreFixturesDir = prependDir("moreFixtures");

describe("#findAllDependencies", function() {

  it("works for a main file without an explicit module statement", function () {
    return compiler.findAllDependencies(prependFixturesDir("SimplestMain.elm")).then(function(results) {
      expect(results).to.deep.equal([])
    });
  });

  it("works for a file with three dependencies", function () {
    return compiler.findAllDependencies(prependFixturesDir("Parent.elm")).then(function(results) {
      expect(results).to.deep.equal(
        [ "Test/ChildA.elm", "Test/ChildB.elm", "Native/Child.js" ].map(prependFixturesDir)
      );
    });
  });

  it("works for a file with nested dependencies", function () {
    return compiler.findAllDependencies(prependFixturesDir("ParentWithNestedDeps.elm")).then(function(results) {
      expect(results).to.deep.equal(
        [ "Test/ChildA.elm", "Test/Sample/NestedChild.elm", "Test/ChildB.elm", "Native/Child.js" ].map(prependFixturesDir)
      );
    });
  });

  it("works for a non-root file with nested dependencies", function () {
    return compiler.findAllDependencies(prependFixturesDir(
        path.join("Nested", "Parent", "Test.elm"))).then(function(results) {
      expect(results).to.deep.equal(
        [ "Test/ChildA.elm", "Nested/Child.elm", "Nested/Test/Child.elm", "Test/Sample/NestedChild.elm", "Test/ChildB.elm", "Native/Child.js" ].map(prependFixturesDir)
      );
    });
  });

  it("works for a file with dependencies defined via source-directories in elm-package.json", function () {
    return compiler.findAllDependencies(prependFixturesDir("ParentWithSourceDirectoriesDeps.elm")).then(function(results) {
      expect(results).to.deep.equal(
          [ "Sibling.elm", "AnotherTest/Cousin.elm" ].map(prependMoreFixturesDir)
      );
    });
  });
});
