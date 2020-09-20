import * as chai from "chai";

import { processOptions, Options } from "../src";

const expect = chai.expect;

describe("#options", function () {
    it("adds runtime options as arguments", function () {
        const opts: Options = {
            verbose: true,
            runtimeOptions: ["-A128M", "-H128M", "-n8m"]
        };
        const source = "Nonexistant.elm";

        const processed = processOptions(source, opts);
        const argsResult = processed.args.join(" ");

        return expect(argsResult).to.equal(`make ${source} +RTS -A128M -H128M -n8m -RTS`);
    });
});
