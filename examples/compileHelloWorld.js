var compile = require("../dist/index.js").compile;
var compileToString = require("../dist/index.js").compileToString;

compile(["./Main.elm"], {
  output: "compiled-hello-world.js"
}).on('close', function(exitCode) {
  console.log("Finished with exit code", exitCode);
});


compileToString(["./Main.elm"], {}).then(function(data){
    console.log("compileToString produced a string with this length:", data.toString().length);
});

compileToString(["./Main.elm"], { output: "index.html" }).then(function(data){
    console.log("compileToString --output index.html produced a string with this length:", data.toString().length);
});
