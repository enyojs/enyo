#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var outpipe = require('outpipe');

var fromArgs = require('./args.js');
var w = fromArgs(process.argv.slice(2));

var outfile = w.argv.o || w.argv.outfile;
var verbose = w.argv.v || w.argv.verbose;

if (w.argv.version) {
    console.error('watchify v' + require('../package.json').version +
        ' (in ' + path.resolve(__dirname, '..') + ')'
    );
    console.error('browserify v' + require('browserify/package.json').version +
        ' (in ' + path.dirname(require.resolve('browserify')) + ')'
    );
    return;
}

if (!outfile) {
    console.error('You MUST specify an outfile with -o.');
    process.exit(1);
}

var bytes, time;
w.on('bytes', function (b) { bytes = b });
w.on('time', function (t) { time = t });

w.on('update', bundle);
bundle();

function bundle () {
    var didError = false;
    var outStream = process.platform === 'win32'
        ? fs.createWriteStream(outfile)
        : outpipe(outfile);

    var wb = w.bundle();
    wb.on('error', function (err) {
        console.error(String(err));
        didError = true;
        outStream.end('console.error('+JSON.stringify(String(err))+');');
    });
    wb.pipe(outStream);

    outStream.on('error', function (err) {
        console.error(err);
    });
    outStream.on('close', function () {
        if (verbose && !didError) {
            console.error(bytes + ' bytes written to ' + outfile
                + ' (' + (time / 1000).toFixed(2) + ' seconds)'
            );
        }
    });
}
