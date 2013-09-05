#!/usr/bin/env node
/* jshint node: true */
/**
# deploy.js - portable deployment script

This portable Node.js script minifies your application, its libraries,
and the Enyo framework it is using.  The resulting application
is suitable for production usage, either hosted on a Web server or
embedded into a PhoneGap container.

The script is intended to be run from the application's root directory
(unlike previous, deprecated incarnations of the scripts `deploy.sh` and
`deploy.bat` that shipped within the `bootplate` application), where it
expects to find a file called `package.js` (unless the user specifies an
alternate location using the `-p` flag).

This script comes along with Enyo.  It automatically uses and embeds the
Enyo version it is shipped with, unless the user specifies another
Enyo version using the `-e enyo_dir` flag.

This script uses the application manifest `deploy.json` if found.  Here
is the content of a typical application manifest:

```json
{
	"enyo": "./enyo",
	"packagejs": "./package.js",
	"assets": ["./icon.png", "./index.html", "./assets"],
	"libs": ["./lib/onyx", "./lib/layout"]
}
```

When the application does not have a root-level `deploy.json` manifest
file, this script expects to find the following files and folders in the
application root directory.  Each of them is copied verbatim into the
output production/deployment folder (the one optionally given using
the `-o` flag).

* `index.html`, the application startup page
* `icon.png`, the application icon
* `assets/`holds the static application assets, such as images,
  videos, etc.

When your application has library dependencies (for example,
`lib/mylib`), this script uses the library manifest
`lib/mylib/deploy.json` (if present) or the old-fashioned deployment
scripts `lib/mylib/deploy.sh` (on Linux and Mac OSX) or
`lib/mylib/deploy.bat` (on Windows).  If neither exists, then the
entire library is copied (except for the `.git`, `target` and `build`
directories).

Here is the content of a typical library manifest:

```json
{
	"source": ".",
	"assets": ["assets", "images", "README.txt", "LICENSE-2.0.txt"],
	"libs": []
}
```

**NOTE:** When you change the default value of the build folder name
(using `--build` or `-b`) you must adapt the content of your
`index.html` accordingly.

**NOTE:** The test build folder (`./build` by default) and the output
folder (`PWD/deploy` by default) are recursively deleted each time this
command is run, so do not store any source code in either location.

 */

// Load dependencies
var nopt = require("nopt"),
	path = require('path'),
	fs = require('fs'),
	shell = require('shelljs');

var stat, script;

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
	console.dir(msg);
	if (msg.error && msg.error.stack) {
		console.error(msg.error.stack);
	}
	if (process.send) {
		process.send(msg);
	}
});

// Parse arguments

var node = process.argv[0],
	deploy = process.argv[1],
	less = true, // LESS compilation, turned on by default
	verbose = false,
	beautify = false,
	noexec = false;

function printUsage() {
	// format generated using node-optimist...
	console.log('\n' +
		'Usage: ' + node + ' ' + deploy + ' [-c][-e enyo_dir][-l lib_dir][-b build_dir][-o out_dir][-p package_js][-s source_dir][-f map_from -t map_to ...]\n' +
		'\n' +
		'Options:\n' +
		'  -v  verbose operation                     [boolean]  [default: ' + verbose + ']\n' +
		'  -b  build directory sub-folder            [default: "./build"]\n' +
		'  -c  do not run the LESS compiler          [boolean]  [default: ' + less + ']\n' +
		'  -e  enyo framework sub-folder             [default: "./enyo"]\n' +
		'  -l  libs sub-folder                       [default: "./lib"]\n' +
		'  -o  alternate output directory            [default: "PWD/deploy/APPNAME"]\n' +
		'  -p  main package.js file (relative)       [default: "./package.js"]\n' +
		'  -s  source code root directory            [default: "PWD"]\n' +
		'  -B  pretty-print (beautify) JS output     [default: "' + beautify + '"]\n' +
		'  -f  remote source mapping: from local path\n' +
		'  -t  remote source mapping: to remote path\n' +
		'  -E|--noexec disallow execution of application-provided scripts [default: false]\n' +
		'  -T|--test generate a build directory in the source tree for testing [default: false]\n' +
		'\n');
}

var opt = nopt(/*knownOpts*/ {
	"build": String,	// relative path
	"less": Boolean,
	"enyo": String,		// relative path
	"lib": String,		// relative path
	"out": path,		// absolute path
	"packagejs": String,	// relative path
	"source": path,		// absolute path
	"verbose": Boolean,
	"help": Boolean,
	"beautify": Boolean,
	"noexec": Boolean,
	"test": Boolean,
	"mapfrom": [String, Array],
	"mapto": [String, Array]
}, /*shortHands*/ {
	"b": "--build",
	"c": "--no-less",
	"e": "--enyo",
	"l": "--lib",
	"o": "--out",
	"p": "--packagejs",
	"s": "--source",
	"v": "--verbose",
	"h": "--help",
	"B": "--beautify",
	"f": "--mapfrom",
	"t": "--mapto",
	"E": "--noexec",
	"T": "--test",
	"?": "--help"
}, process.argv /*args*/, 2 /*slice*/);

var log = function() {};
if (opt.verbose) {
	log = console.log;
}

log("opt:", opt);

if (opt.help) {
	printUsage();
	process.exit(1);
}

if (!opt.source && opt.packagejs) {
	// backward compatibility: use top-level package.js folder as
	// source folder if provided & if no source folder is provided
	opt.source = path.dirname(opt.packagejs);
	opt.packagejs = path.basename(opt.packagejs);
}
opt.source = opt.source || process.cwd();
opt.app = opt.app || path.basename(opt.source);
opt.out = opt.out ? path.resolve(process.cwd(), opt.out) : path.join(process.cwd(), 'deploy', opt.app);

// deploy.js works only when running on top of the source tree...
process.chdir(opt.source);

// application default values may come from the manifest file: deploy.json
var manifest;
try {
	manifest = JSON.parse(fs.readFileSync("deploy.json"));
} catch(e) {
	manifest = {
		_default: true
	};
}

opt.packagejs = opt.packagejs || manifest.packagejs || "package.js";
opt.packagejs = path.relative(process.cwd(), opt.packagejs);
// top-level project folder, relative to top-level package.js
var rootFolder = path.relative(path.dirname(opt.packagejs), ".");

opt.build = opt.build || manifest.build || "build";
opt.enyo = opt.enyo || manifest.enyo || "enyo"; // from top-level folder

log("opt:", opt);

less = (opt.less !== false) && less;
beautify = opt.beautify;
noexec = opt.noexec;
verbose = opt.verbose;

if ((opt.mapfrom || opt.maptop) && (!opt.mapfrom || !opt.mapto || (opt.mapfrom.length != opt.mapto.length))) {
	log("mapfrom:", opt.mapfrom);
	log("mapto:", opt.mapto);
	console.error("Error: The number of 'mapfrom' and 'mapto' arguments must match.");
	process.exit(1);
}

var minifier = path.resolve(__dirname, 'minifier', 'minify.js');
log("Using: opt.source=" + opt.source);
log("Using: opt.out=" + opt.out);
log("Using: opt.build=" + opt.build);
log("Using: opt.enyo=" + opt.enyo);
log("Using: opt.packagejs=" + opt.packagejs);
log("Using: opt.test=" + opt.test);
log("Using: less=" + less);
log("Using: beautify=" + beautify);
log("Using: noexec=" + noexec);

// utils

function run(args) {
	var command = '"' + args.join('" "') + '"';
	var report;
	log("% ", command);
	report = shell.exec(command, { silent: !verbose });
	if (report.code !== 0) {
		throw new Error("Fail: '" + command + "'\n" + report.output);
	}
}

// Prepare target directories

log("% rm -rf " + opt.out);
shell.rm('-rf', opt.out);
log("% mkdir -p " + opt.out + "/" + opt.build);
shell.mkdir('-p', path.join(opt.out, opt.build));

log("% rm -rf " + opt.build);
shell.rm('-rf', opt.build);

// Build / Minify

var args, i;
if (!opt.mapfrom || opt.mapfrom.indexOf("enyo") < 0) {
	console.log("Minify-ing Enyo...");
	args = [node, minifier,
		'-no-alias',
		'-enyo', opt.enyo,
		'-destdir', opt.out,
		'-output', path.join(opt.build, 'enyo'),
		(beautify ? '-beautify' : '-no-beautify'),
		path.join(opt.enyo, 'minify', 'package.js')];
	if (opt.mapfrom) {
		for (i=0; i<opt.mapfrom.length; i++) {
			args.push("-f", opt.mapfrom[i], "-t", opt.mapto[i]);
		}
	}
	run(args);
} else {
	console.log("Skipping Enyo minification (will be mapped to " + opt.mapto[opt.mapfrom.indexOf("enyo")] + ").");
}

console.log("Minify-ing the application...");
args = [node, minifier,
	// ENYODIR, from the the top-level package.js
	'-enyo', path.join(rootFolder, opt.enyo),
	'-destdir', opt.out,
	'-output', path.join(opt.build, 'app'),
	(less ? '-less' : '-no-less'),
	(beautify ? '-beautify' : '-no-beautify'),
	opt.packagejs];
if (opt.mapfrom) {
	for (i=0; i<opt.mapfrom.length; i++) {
		args.push("-f", opt.mapfrom[i], "-t", opt.mapto[i]);
	}
}
if (opt.lib) {
	// LIBPATH, from the top-level package.js
	args.push("-lib", path.join(rootFolder, opt.lib));
}
run(args);

// Deploy / Copy

if(!manifest._default) {
	/* Pick the list of files & folders to copy from the application manifest */
	deployDir(".");
} else {
	/* Use legacy built-in list of files & folders to copy */
	shell.mkdir('-p', path.join(opt.out, 'lib'));
	shell.cp('index.html', opt.out);
	shell.cp('icon.png', opt.out);

	if(shell.test('-d', 'assets')) {
		shell.cp('-r', 'assets', opt.out);
	}

	if(shell.test('-d', 'lib')) {
		shell.ls('lib').forEach(function(lib) {
			var libDir = path.join("lib", lib);
			if (opt.mapfrom && opt.mapfrom.indexOf(libDir) >= 0) {
				// Don't deploy libraries that are loaded from elsewhere
				console.log("Skipping:", libDir);
			} else {
				deployDir(libDir);
			}
		});
	}
}

if (opt.test) {
	log("Test build dir");
	log("% cp -r " + path.join(opt.out, opt.build) + " .");
	shell.cp('-r', path.join(opt.out, opt.build), ".");
}

function deployDir(subDir) {
	log("Deploying '" + subDir + "'...");
	try {
		var manifest = JSON.parse(fs.readFileSync(path.join(subDir, "deploy.json")));
		if (Array.isArray(manifest.assets)) {
			manifest.assets.forEach(function(asset) {
				var dstAssetDir = path.dirname(path.join(opt.out, subDir, asset));
				log("% mkdir -p " + dstAssetDir);
				shell.mkdir('-p', dstAssetDir);
				log("% cp -r " + path.join(subDir, asset) + "...");
				shell.cp('-r', path.join(subDir, asset), dstAssetDir);
			});
		}
		if (Array.isArray(manifest.libs)) {
			manifest.libs.forEach(function(libDir) {
				deployDir(path.join(subDir, libDir));
			});
		}
	} catch(e) {
		// backward compatibility: run deploy.sh or deploy.bat
		try {
			if (noexec) {
				console.warn("noexec: Skip execution of client-provided code");
				throw new Error("noexec: Skip execution of client-provided code");
			}
			script = path.join(subDir, 'deploy.' + (process.platform === 'win32' ? 'bat' : 'sh'));
			stat = fs.statSync(script);
			if (!stat.isFile()) {
				throw new Error("*** Not a file: '" + script + "'");
			}
			var command = [script, path.join(opt.out, subDir)];
			if (process.platform !== 'win32') {
				command.unshift("sh");
			}
			run(command, path.join(subDir));
		} catch(e2) {
			// no deploy.(js|bat|sh): copy everything...
			var dd = path.dirname(path.join(opt.out, subDir));
			log("% mkdir -p " + dd);
			shell.mkdir('-p', dd);

			var sd = subDir;
			log("% cp -r " + sd + " " + dd);
			shell.cp('-r', sd, dd);

			// ...then remove ".git" & others, if any
			log("% rm -rf " + dd + "/(.git|target|build|deploy)");
			shell.rm('-rf', path.join(opt.out, subDir, '.git'));
			shell.rm('-rf', path.join(opt.out, subDir, 'target'));
			shell.rm('-rf', path.join(opt.out, subDir, 'build'));
			shell.rm('-rf', path.join(opt.out, subDir, 'deploy'));
		}
	}
}

console.log("Success: the deployable application is available in: ", opt.out);
process.exit(0);
