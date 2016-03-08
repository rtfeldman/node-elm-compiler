var compile = require("../../index.js").compile;

var mains = [
  "./Components/WidgetA/Main.elm",
  "./Components/WidgetB/Main.elm"
];

compile(mains, {
  output: "elm-bundle.js"
}).on('close', function(exitCode) {
  console.log("Finished with exit code", exitCode);
});
