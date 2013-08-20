#!/usr/bin/env node
/* jshint node: true */
/**
# deploy.js - portable deployment script

This portable Node.js script minifies both your application, its
libraries & the Enyo framework it is using.  The resulting application
is suitable for production usage, either hosted on a web-server or
embedded into a PhoneGap container.

The script is intended to be run from the application's root directory
(This is unlike previous deprecated incarnations of the scripts
`deploy.sh` and `deploy.bat` that shipped within the `bootplate`
application), where it expects to find a file called `package.js`
(unless the user specifies an alternate location using the `-p` flag).

This script comes along with Enyo.  It automatically uses & embeds the
Enyo version it is shipped with, unless the user specifies another
Enyo version using the `-e enyo_dir` flag.

This script uses the application manifest `deploy.json` if found.  Here
is a typical application manifest content:

```json
{
	"enyo": "enyo",
	"source": ".",
	"assets": ["icon.png", "index.html", "assets"],
	"libs": ["lib/onyx", "lib/layout"]
}
```

When the application does not have a root-level `deploy.json` manifest
file, this script expects to find the following files & folders in the
application root directory.  Each of them is copied verbatim in the
output production/deployment folder (the one optionally given using
the `-o` flag).

* `index.html`, the application startup page
* `icon.png`, the application icon
* `assets/`holds the static application assets, such as images,
  videos... etc.

When you application has library dependencies (for example
`lib/mylib`), this script uses the library manifest
`lib/mylib/deploy.json` (if present) or the old-fashioned deployment
scripts `lib/mylib/deploy.sh` (on Linux & Mac OSX) or
`lib/mylib/deploy.bat` (on Windows).  If neither exist, then the
entire library is copied (except for `.git`, `target` and `build`
directories).

Here is a typical library manifest content:

```json
{
	"source": ".",
	"assets": ["assets", "images"],
	"libs": []
}
```

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
	enyoDir = path.resolve(sourceDir, "enyo"),
	buildDir = path.resolve(sourceDir, "build"),
	basename = path.basename(sourceDir),
	outDir = path.resolve(sourceDir, 'deploy', basename),
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
		'  -b  alternate build directory             [default: "' + buildDir + '"]\n' +
		'  -c  do not run the LESS compiler          [boolean]  [default: ' + less + ']\n' +
		'  -e  location of the enyo framework        [default: "' + enyoDir + '"]\n' +
		'  -l  location of the lib folder            [default: "' + enyoDir + '/../lib"]\n' +
		'  -o  alternate output directory            [default: "' + outDir + '"]\n' +
		'  -p  location of the main package.js file  [default: "' + packageJs + '"]\n' +
		'  -s  source code root directory            [default: "' + sourceDir + '"]\n' +
		'  -B  pretty-print (beautify) JS output     [default: "' + beautify + '"]\n' +
		'  -f  remote source mapping: from local path\n' +
		'  -t  remote source mapping: to remote path' +
		'  -E|--noexec disallow execution of application-provided scripts [default: false]' +
		'\n');
}

var opt = nopt(/*knownOpts*/ {
	"build": path,
	"less": Boolean,
	"enyo": path,
	"lib": path,
	"out": path,
	"packagejs": path,
	"source": path,
	"verbose": Boolean,
	"help": Boolean,
	"beautify": Boolean,
	"noexec": Boolean,
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
	"?": "--help"
}, process.argv /*args*/, 2 /*slice*/);

if (opt.help) {
	printUsage();
	process.exit(1);
}

// application default values may come from the manifest file: deploy.json

var manifest;
try {
	manifest = JSON.parse(fs.readFileSync(path.join(sourceDir, "deploy.json")));
} catch(e) {
	manifest = {
		_default: true
	};
}

enyoDir = manifest.enyo ? path.join(process.cwd(), manifest.enyo) : enyoDir;
packageJs = manifest.source ? path.join(process.cwd(), manifest.source, "package.js") : packageJs;

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
beautify = opt.beautify;
noexec = opt.noexec;
verbose = opt.verbose;

var log = function() {};
if (verbose) {
	log = console.log;
}

if ((opt.mapfrom || opt.maptop) && (!opt.mapfrom || !opt.mapto || (opt.mapfrom.length != opt.mapto.length))) {
	log("mapfrom:", opt.mapfrom);
	log("mapto:", opt.mapto);
	console.error("Error: The number of 'mapfrom' and 'mapto' arguments must match.");
	process.exit(1);
}

var minifier = path.resolve(__dirname, 'minifier', 'minify.js');
log("Using: build_dir=" + buildDir);
log("Using: enyo_dir=" + enyoDir);
log("Using: out_dir=" + outDir);
log("Using: packagejs=" + packageJs);
log("Using: source_dir=" + sourceDir);
log("Using: less=" + less);
log("Using: beautify=" + beautify);
log("Using: noexec=" + noexec);

// utils

function run(args, wd) {
	var cwd = process.cwd();
	log("% cd " + wd);
	process.chdir(path.resolve(wd));
	var command = '"' + args.join('" "') + '"';
	var report;
	log("% ", command);
	report = shell.exec(command, { silent: true });
	if (report.code !== 0) {
		throw new Error("Fail: '" + command + "'\n" + report.output);
	}
	log("% cd " + cwd);
	process.chdir(cwd);
}

// Prepare target directory

log("% rm -rf " + outDir);
shell.rm('-rf', outDir);
log("% mkdir -p " + outDir);
shell.mkdir('-p', outDir);

// Build / Minify
var args;
if (!opt.mapfrom || opt.mapfrom.indexOf("enyo") < 0) {
	console.log("Minify-ing Enyo...");
	args = [node, minifier,
		'-no-alias',
		'-enyo', enyoDir,
		// XXX generates $buildDir/enyo.(js|css)' so this is
		// XXX rather an 'output_prefix' than an 'out_dir'...
		'-output', path.join(buildDir, 'enyo'),
		(beautify ? '-beautify' : '-no-beautify'),
		path.join(enyoDir, 'minify', 'package.js')];
	if (opt.mapfrom) {
		for (var i=0; i<opt.mapfrom.length; i++) {
			args.push("-f", opt.mapfrom[i], "-t", opt.mapto[i]);
		}
	}
	run(args, path.resolve(enyoDir, 'minify'));
} else {
	console.log("Skipping Enyo minification (will be mapped to " + opt.mapto[opt.mapfrom.indexOf("enyo")] + ").");
}

console.log("Minify-ing the application...");
args = [node, minifier,
	'-enyo', enyoDir,
	'-output', path.join(buildDir, 'app'),
	(less ? '-less' : '-no-less'),
	(beautify ? '-beautify' : '-no-beautify'),
	packageJs];
if (opt.mapfrom) {
	for (var i=0; i<opt.mapfrom.length; i++) {
		args.push("-f", opt.mapfrom[i], "-t", opt.mapto[i]);
	}
}
if (opt.lib) {
	args.push("-lib", opt.lib);
}
run(args, path.resolve(sourceDir));

// Deploy / Copy

console.log("Copying assets...");
if(!manifest._default) {
	/* Pick the list of files & folders to copy from the application manifest */
	deployDir(".", sourceDir, outDir);
} else {
	/* Use legacy built-in list of files & folders to copy */
	shell.mkdir('-p', path.join(outDir, 'lib'));
	shell.cp(path.join(sourceDir, 'index.html'), path.join(sourceDir, 'icon.png'), outDir);
	shell.cp('-r', buildDir, outDir);

	var assetsSrcDir = path.join(sourceDir, 'assets');
	if(shell.test('-d', assetsSrcDir)) {
		shell.cp('-r', assetsSrcDir, outDir);
	}

	var libsSrcDir = path.join(sourceDir, 'lib');
	if(shell.test('-d', libsSrcDir)) {
		shell.ls(libsSrcDir).forEach(function(lib) {
			var libDir = path.join("lib", lib);
			if (opt.mapfrom && opt.mapfrom.indexOf(libDir) >= 0) {
				// Don't deploy libraries that are loaded from elsewhere
				console.log("Skipping:", libDir);
			} else {
				deployDir(libDir, sourceDir, outDir);
			}
		});
	}
}

function deployDir(subDir, srcDir, dstDir) {
	log("Deploying " + subDir + "...");
	try {
		var manifest = JSON.parse(fs.readFileSync(path.join(srcDir, subDir, "deploy.json")));
		if (Array.isArray(manifest.assets)) {
			manifest.assets.forEach(function(asset) {
				var dstAssetDir = path.dirname(path.join(dstDir, subDir, asset));
				shell.mkdir('-p', dstAssetDir);
				log("% cp -r " + path.join(subDir, asset) + "...");
				shell.cp('-r', path.join(srcDir, subDir, asset), dstAssetDir);
			});
		}
		if (Array.isArray(manifest.libs)) {
			manifest.libs.forEach(function(libDir) {
				deployDir(path.join(subDir, libDir), srcDir, dstDir);
			});
		}
	} catch(e) {
		// backward compatibility: run deploy.sh or deploy.bat
		try {
			if (noexec) {
				console.warn("noexec: Skip execution of client-provided code");
				throw new Error("noexec: Skip execution of client-provided code");
			}
			script = path.join(srcDir, subDir, 'deploy.' + (process.platform === 'win32' ? 'bat' : 'sh'));
			stat = fs.statSync(script);
			if (!stat.isFile()) {
				throw new Error("*** Not a file: '" + script + "'");
			}
			var command = [script, path.join(dstDir, subDir)];
			if (process.platform !== 'win32') {
				command.unshift("sh");
			}
			run(command);
		} catch(e2) {
			// no deploy.(js|bat|sh): copy everything...
			var dd = path.dirname(path.join(dstDir, subDir));
			log("% mkdir -p " + dd);
			shell.mkdir('-p', dd);

			var sd = path.join(srcDir, subDir);
			log("% cp -r " + sd + " " + dd);
			shell.cp('-r', sd, dd);

			// ...then remove ".git" & others, if any
			log("% rm -rf " + dd + "/(.git|target|build|deploy)");
			shell.rm('-rf', path.join(dstDir, subDir, '.git'));
			shell.rm('-rf', path.join(dstDir, subDir, 'target'));
			shell.rm('-rf', path.join(dstDir, subDir, 'build'));
			shell.rm('-rf', path.join(dstDir, subDir, 'deploy'));
		}
	}
}

console.log("Success:  the deployable application is available in: ", outDir);
process.exit(0);