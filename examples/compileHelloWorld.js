var compile = require("../index.js").compile;
var compileToString = require("../index.js").compileToString;

compile(["./HelloWorld.elm"], {
  output: "compiled-hello-world.js"
}).on('close', function(exitCode) {
  console.log("Finished with exit code", exitCode);
});


compileToString(["./HelloWorld.elm"], {}).then(function(data){
    console.log("compileToString produced a string with this length:", data.toString().length);
});

compileToString(["./HelloWorld.elm"], { output: "index.html" }).then(function(data){
    console.log("compileToString --output index.html produced a string with this length:", data.toString().length);
});
