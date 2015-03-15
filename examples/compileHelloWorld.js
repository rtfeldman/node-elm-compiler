var compile = require("../index.js").compile;

compile(["./HelloWorld.elm"], {
  output: "compiled-hello-world.js",
  onFinished: function() {
    console.log("Finished!");
  }
})
