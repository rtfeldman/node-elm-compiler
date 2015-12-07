var compile = require("../index.js").compile;
var compileToString = require("../index.js").compileToString;

compile(["./HelloWorld.elm"], {
  output: "compiled-hello-world.js"
}).on('close', function(exitCode) {
  console.log("Finished with exit code", exitCode);
});


compileToString(["./HelloWorld.elm"], { yes: true }, function(err, data){
    console.log("Text", data.toString());
});

compileToString(["./HelloWorld.elm"], { yes: true, output: "index.html" }, function(err, data){
    console.log("Text", data.toString());
});
