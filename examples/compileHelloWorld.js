var compile = require("../index.js").compile;

compile(["./HelloWorld.elm"], {
  output: "compiled-hello-world.js"
}).on('close', function(exitCode) {
  console.log("Finished with exit code", exitCode);
});
