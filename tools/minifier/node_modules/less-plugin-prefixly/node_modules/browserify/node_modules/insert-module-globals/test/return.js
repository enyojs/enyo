var test = require('tap').test;
var mdeps = require('module-deps');
var bpack = require('browser-pack');
var insert = require('../');
var concat = require('concat-stream');
var vm = require('vm');

test('early return', function (t) {
    t.plan(4);
    var s = mdeps({ transform: [ inserter ] });
    s.pipe(bpack({ raw: true })).pipe(concat(function (src) {
        var c = {
            t: t,
            setTimeout: setTimeout,
            clearTimeout: clearTimeout
        };
        vm.runInNewContext(src, c);
    }));
    s.end(__dirname + '/return/main.js');
});

function inserter (file) {
    return insert(file, {
        basedir: __dirname + '/return'
    });
}
