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

var optimist = require('optimist'),
    path = require('path'),
    fs = require('fs'),
    util = require('util'),
    shell = require('shelljs');

var stat, ppwd, lib, script, scripts = {};

// Parse arguments

var node = process.argv[0],
    sourceDir = process.cwd(),
    packageJs = path.resolve(sourceDir, "package.js"),
    enyoDir = path.resolve(__dirname, '..'),
    buildDir = path.resolve(sourceDir, "build"),
    name = path.basename(sourceDir),
    outDir = path.resolve(sourceDir, 'deploy', name);

var argv = optimist.usage("Usage: $0 [-c][-e enyo_dir][-b build_dir][-o out_dir][-p package_js]", {
	'b': {
		description: "alternate build directory",
		required: false,
		default: buildDir
	},
	'c': {
		description: "do not run the LESS compiler",
		boolean: true,
		required: false,
		default: false
	},
	'e': {
		description: "location of the enyo framework",
		required: false,
		default: enyoDir
	},
	'o': {
		description: "alternate output directory",
		required: false,
		default: outDir
	},
	'p': {
		description: "location of the main package.js file",
		required: false,
		default: packageJs
	},
}).argv;

if (argv.h) {
	debugger;
	optimist.showHelp();
	process.exit(1);
}

var minifier = path.resolve(argv.e, 'tools', 'minifier', 'minify.js');
console.log("Using: enyo_dir=" + argv.e);
console.log("Using: build_dir=" + argv.b);
console.log("Using: out_dir=" + argv.o);
console.log("Using: package_js=" + argv.p);

// utils

function run(args) {
	var command = args.join(' ');
	console.log("Running: '"+ command + "'");
	if (shell.exec(command).code !== 0) {
		throw new Error("*** Fail: '" + command + "'");
	}
}

// Prepare target directory

shell.rm('-rf', path.resolve(argv.o));
shell.rm('-rf', path.resolve(argv.o));
shell.mkdir('-p', path.join(argv.o));

// Build / Minify

console.log("Minify-ing the embedded Enyo...");
process.chdir(path.resolve(argv.e, 'minify'));
run([node, minifier,
     '-no-alias',
     '-enyo', argv.e,
     // XXX generates $buildDir/enyo.(js|css)' so this is
     // XXX rather a 'prefix' than an 'output'...
     '-output', path.join(argv.b, 'enyo'),
     'package.js']);

console.log("Minify-ing the application");
process.chdir(sourceDir);
process.chdir(path.dirname(argv.p));
run([node, minifier,
     '-enyo', argv.e,
     '-output', path.join(argv.b, 'app'),
     (argv.c ? '-no-less' : ''),
     'package.js']);
process.chdir(sourceDir);

// Deploy / Copy

shell.mkdir('-p', path.join(argv.o, 'lib'));
shell.cp(path.join(sourceDir, 'index.html'), path.join(sourceDir, 'icon.png'), argv.o);
shell.cp('-r', path.join(sourceDir, 'assets'), argv.b, argv.o);

shell.ls(path.join(sourceDir, 'lib')).forEach(function(lib) {
	var libOutdir = path.join(argv.o, 'lib', lib);
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
		} catch(e) {
			// no deploy.(js|bat|js): copy everything
			shell.cp('-r', path.join(sourceDir, 'lib', lib), path.join(argv.o, 'lib'));
		}
	}
});
