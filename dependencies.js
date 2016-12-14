const stream = require('stream');
const fs = require('fs');

/* Read imports from a given file and return them
*/
function readImports(file){
    return new Promise(function(resolve, reject){
        // read 60 chars at a time. roughly optimal: memory vs performance
        var stream = fs.createReadStream(file, {encoding: 'utf8', highWaterMark: 8 * 60});

        var buffer = "";
        var parser = new Parser();

        stream.on('open', function () {});

        stream.on('data', function(chunk){
            buffer += chunk;
            // when the chunk has a newline, process each line
            if (chunk.indexOf('\n') > -1){
                var lines = buffer.split('\n');

                lines.slice(0, lines.length - 1).forEach(parser.parseLine.bind(parser));
                buffer = lines[lines.length - 1];

                // end the stream early if we're past the imports
                // to save on memory
                if (parser.isPastImports()){
                    stream.destroy();
                }
            }
        });
        stream.on('close', function (){
            resolve(parser.getImports());
        });
    });
}

function Parser(){
    var moduleRead = false;
    var readingImports = false;
    var parsingDone = false;
    var imports = [];

    this.parseLine = function(line){
        if (parsingDone) return;

        if (!moduleRead &&
            (line.startsWith('module ')
                || line.startsWith('port module')
                || line.startsWith('effect module')
            )
        ) {
            moduleRead = true;
        } else if (moduleRead && line.indexOf('import ') === 0){
            readingImports = true;
        }

        if (readingImports){
            if (line.indexOf('import ') === 0){
                imports.push(line);
            } else if (
                line.indexOf(' ') === 0
                || line.trim().length === 0
                || line.startsWith('--')
                || line.startsWith('{-')
                || line.startsWith('-}')
                ) {
                // ignore lines starting with whitespace while parsing imports
                // and start and end of comments
            } else {
                // console.log('detected end of imports', line);
                parsingDone = true;
            }
        }
    };

    this.getImports = function(){
        return imports;
    }

    this.isPastImports = function(){
        return parsingDone;
    }

    return this;
}


module.exports = {
    readImports: readImports
};
