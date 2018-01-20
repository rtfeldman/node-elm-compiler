var compile = require("../index.js").compile;
var compileToString = require("../index.js").compileToString;

var findElmBinaries = require("../index.js").findElmBinaries;

findElmBinaries().then(function(foundPath){
    console.log(foundPath);
}).catch(function(err){
    console.log(err);
});

compile(["./HelloWorld.elm"], {
  output: "compiled-hello-world.js"
}).on('close', function(exitCode) {
  console.log("Finished with exit code", exitCode);
});


compileToString(["./HelloWorld.elm"], { yes: true }).then(function(data){
    console.log("Text", data.toString());
});

compileToString(["./HelloWorld.elm"], { yes: true, output: "index.html" }).then(function(data){
    console.log("Text", data.toString());
});
