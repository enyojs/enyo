#!/usr/bin/env node

/**
# deploy.js - portable deployment script

This portable Node.js script minifies both your application, its
libraries & the Enyo framework it is using.  The resulting application
is suitable for production usage, either hostet on a web-server or
embedded into a PhoneGap container.

The script is intended to be run from the application's root directory
(This is unlike previous deprecated incarnations of the scripts
`deploy.sh` and `deploy.bat` that shipped within the `bootplate`
application), where it expects to find a file called `package.js`
(unless the user specifies an alternate location using the `-p` flag).

This script comes along with Enyo.  It automatically uses & embeds the
Enyo version it is shipped with, unless the user specifies another
Enyo version using the `-e enyo_dir` flag.

When you application has library dependencies (for example
`lib/mylib`), this script uses the `lib/mylib/manifest.json` (if
present) or the old-fashioned deployment scripts `lib/mylib/deploy.sh`
(on Linux & Mac OSX) or `lib/mylib/deploy.bat` (on Windows).
If neither exist, then the entire library is copied (except for .git dir).

This script also expects to find the following files & folders in the
application root directory.  Each of them is copied verbatim in the
output production/deployment folder (the one optionally given using
the `-o` flag).

* `index.html`, the application startup page
* `icon.png`, the application icon
* `assets/`holds the static application assets, such as images,
  videos... etc.

 */

// Load dependencies

var nopt = require("nopt"),
    path = require('path'),
    fs = require('fs'),
    util = require('util'),
    shell = require('shelljs');

var stat, ppwd, lib, script, scripts = {};

// Send message to parent node process, if any
process.on('uncaughtException', function (err) {
	var errMsg = err.toString() + err.stack;
	console.error(errMsg);
	if (process.send) {
		// only available if parent process is node
		process.send({error: errMsg});
	}
	process.exit(1);
});
// receive error messages from child node processes
process.on('message', function(msg) {
	console.dir(basename, msg);
	if (msg.error && msg.error.stack) {
		console.error(basename, msg.error.stack);
	}
	if (process.send) {
		process.send(msg);
	}
});

// Parse arguments

var node = process.argv[0],
    deploy = process.argv[1],
    sourceDir = process.cwd(),
    packageJs = path.resolve(sourceDir, "package.js"),
    enyoDir = path.resolve(__dirname, '..'),
    buildDir = path.resolve(sourceDir, "build"),
    name = path.basename(sourceDir),
    outDir = path.resolve(sourceDir, 'deploy', name),
    less = true, // LESS compilation, turned on by default
    verbose = false;

function printUsage() {
	// format generated using node-optimist...
	console.log('\n' +
		    'Usage: ' + node + ' ' + deploy + ' [-c][-e enyo_dir][-b build_dir][-o out_dir][-p package_js][-s source_dir]\n' +
		    '\n' +
		    'Options:\n' +
		    '  -v  verbose operation                     [boolean]  [default: ' + verbose + ']\n' +
		    '  -b  alternate build directory             [default: "' + buildDir + '"]\n' +
		    '  -c  do not run the LESS compiler          [boolean]  [default: ' + less + ']\n' +
		    '  -e  location of the enyo framework        [default: "' + enyoDir + '"]\n' +
		    '  -o  alternate output directory            [default: "' + outDir + '"]\n' +
		    '  -p  location of the main package.js file  [default: "' + packageJs + '"]\n' +
		    '  -s  source code root directory            [default: "' + sourceDir + '"]\n' +
		    '\n');
}

var opt = nopt(/*knownOpts*/ {
	"build":	path,
	"less":		Boolean,
	"enyo":		path,
	"out":		path,
	"packagejs":	path,
	"source":	path,
	"verbose":	Boolean,
	"help":		Boolean
}, /*shortHands*/ {
	"b": "--build",
	"c": "--no-less",
	"e": "--enyo",
	"o": "--out",
	"p": "--packagejs",
	"s": "--source",
	"v": "--verbose",
	"h": "--help",
	"?": "--help"
}, process.argv /*args*/, 2 /*slice*/);

if (opt.help) {
	printUsage();
	process.exit(1);
}

// nopt has not default values system
buildDir = opt.build || buildDir;
enyoDir = opt.enyo || enyoDir;
outDir = opt.out || outDir;
packageJs = opt.packagejs ||
	(opt.source ? path.join(opt.source, 'package.js') : undefined) ||
	packageJs;
sourceDir = opt.source ||
	(opt.packagejs ? path.dirname(opt.packagejs) : undefined) ||
	sourceDir;
less = (opt.less !== false) && less;
verbose = opt.verbose;

var minifier = path.resolve(enyoDir, 'tools', 'minifier', 'minify.js');
if (verbose) console.log("Using: build_dir=" + buildDir);
if (verbose) console.log("Using: enyo_dir=" + enyoDir);
if (verbose) console.log("Using: out_dir=" + outDir);
if (verbose) console.log("Using: packagejs=" + packageJs);
if (verbose) console.log("Using: source_dir=" + sourceDir);
if (verbose) console.log("Using: less=" + less);

// utils

function run(args) {
	var command = '"' + args.join('" "') + '"';
	var report;
	if (verbose) console.log("Running: '", command, "' from '", process.cwd(), "'");
	report = shell.exec(command, { silent: true });
	if (report.code !== 0) {
		throw new Error("Fail: '" + command + "'\n" + report.output);
	}
}

// Prepare target directory

shell.rm('-rf', path.resolve(outDir));
shell.rm('-rf', path.resolve(outDir));
shell.mkdir('-p', path.join(outDir));

// Build / Minify

console.log("Minify-ing Enyo...");
process.chdir(path.resolve(enyoDir, 'minify'));
run([node, minifier,
     '-no-alias',
     '-enyo', enyoDir,
     // XXX generates $buildDir/enyo.(js|css)' so this is
     // XXX rather an 'output_prefix' than an 'out_dir'...
     '-output', path.join(buildDir, 'enyo'),
     'package.js']);

console.log("Minify-ing the application...");
process.chdir(path.dirname(packageJs));
run([node, minifier,
     '-enyo', enyoDir,
     '-output', path.join(buildDir, 'app'),
     (less ? '-less' : '-no-less'),
     'package.js']);
process.chdir(sourceDir);

// Deploy / Copy

shell.mkdir('-p', path.join(outDir, 'lib'));
shell.cp(path.join(sourceDir, 'index.html'), path.join(sourceDir, 'icon.png'), outDir);
shell.cp('-r', buildDir, outDir);

var assetsSrcDir = path.join(sourceDir, 'assets');
if(shell.test('-d', assetsSrcDir)) {
	shell.cp('-r', assetsSrcDir, outDir);
}

var libSrcDir = path.join(sourceDir, 'lib');
if(shell.test('-d', libSrcDir)) {
	shell.ls(libSrcDir).forEach(deployLib);
}

function deployLib(lib) {
	var libOutdir = path.join(outDir, 'lib', lib);
	// load & execute sub-'deploy.js'
	try {
		script = path.join(sourceDir, 'lib', lib, 'deploy.js');
		stat = fs.statSync(script);
		if (!stat.isFile())
			throw new Error("*** Not a file: '" + script + "'");
		scripts[lib] = require(script);
		scripts[lib].deploy(libOutdir);
	} catch(e) {
		// backward compatibility: run deploy.sh or deploy.bat
		try {
			script = path.join(sourceDir, 'lib', lib, 'deploy.' + (process.platform === 'win32' ? 'bat' : 'sh'));
			stat = fs.statSync(script);
			if (!stat.isFile())
				throw new Error("*** Not a file: '" + script + "'");
			run([script, libOutdir]);
		} catch(e2) {
			// no deploy.(js|bat|sh): copy everything (then remove ".git", if any)
			shell.cp('-r', path.join(sourceDir, 'lib', lib), path.join(outDir, 'lib'));
			shell.rm('-rf', path.join(outDir, 'lib', lib, '.git'));
		}
	}
}

console.log("Success:  the deployable application is available in: ", outDir);
process.exit(0);


