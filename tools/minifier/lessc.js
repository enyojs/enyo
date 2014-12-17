/* jshint node: true */
var
	fs = require("fs"),
	path = require("path"),
	walker = require("walker"),
	nopt = require("nopt"),
	less = require("less");

// Shimming path.relative with 0.8.8's version if it doesn't exist
if(!path.relative){
	path.relative = require('./path-relative-shim').relative;
}

// Adding a "plugin" that works with LESS 1.7, for converting pixel measurements to resolution
// independent units i.e. rems.
ResolutionIndependence = function(opts) {
	this._baseSize = opts && opts.baseSize || this._baseSize;
	this._riUnit = opts && opts.riUnit || this._riUnit;
	this._unit = opts && opts.unit || this._unit;
	this._visitor = new less.tree.visitor(this);
};
ResolutionIndependence.prototype = {
	_baseSize: 12,
	_riUnit: 'rem',
	_unit: 'px',
	run: function (root) {
		return this._visitor.visit(root);
	},
	generateRootRule: function () {
		return "html { font-size: " + this._baseSize + "px; }";
	},
	visitRule: function (node) {
		var values = node && node.value && node.value.value && node.value.value.length && node.value.value[0],
			i;

		if (values) {
			if (Array.isArray(values.value)) {
				for (i = 0 ; i < values.value.length; i++) {
					this.parseValue(values.value[i]);
				}
			} else {
				this.parseValue(values);
			}
		}
		return node;
	},
	parseValue: function (valueNode) {
		if (valueNode.value && valueNode.value.toString().indexOf(this._unit) != -1) {
			valueNode.value = parseInt(valueNode.value, 10) / this._baseSize + this._riUnit;
		} else if (valueNode.unit && valueNode.unit.numerator && valueNode.unit.numerator.length &&
			valueNode.unit.numerator[0] == this._unit) {
			valueNode.value = valueNode.value / this._baseSize;
			valueNode.unit.numerator[0] = this._riUnit;
		}
	}
};

var w = console.log;

function printUsage() {
	w("Enyo Less->CSS Compiler");
	w("Usage: lessc.sh|bat [-enyo <path>] [-w] <package-file>");
	w("<package-file>\t", "Path to package file to walk; all LESS files encountered will be compiled");
	w("-enyo <path>\t", "Path to enyo loader (enyo/enyo.js)");
	w("-w\t", "Watch the file and any dependencies, and re-compile on changes");
	w("-h, -?, -help\t", "Show this message");
}

function finish(loader, objs, doneCB) {
	var parser, code, cssFile;
	var report = function(cssFile) {
		return function(e, tree) {
			if (e) {
				w("  Error: \x07" + e.filename + ":" + e.line + ":" + e.column);
				w("    " + e.message);
				if (doneCB) {
					doneCB();
				} else {
					process.exit(1);
				}
			} else {
				try {
					var ri = new ResolutionIndependence();
					var css =
						"/* WARNING: This is a generated file for backward-compatibility.  Most      */\n" +
						"/* users should instead modify LESS files.  If you choose to edit this CSS  */\n" +
						"/* directly rather than LESS files, you should make sure less.xx.yy.min.js  */\n" +
						"/* is commented out in your debug.html, and run deploy.sh/bat using the     */\n" +
						"/* '-c' flag to disable LESS compilation.  This will force the loader and   */\n" +
						"/* minifier to fall back to using CSS files in place of the same-name       */\n" +
						"/* LESS file.                                                               */\n" +
						"\n" + ri.generateRootRule() + "\n" + tree.toCSS({plugins: [ri]});
					fs.writeFileSync(cssFile, css, "utf8");
					nextSheet();
				} catch(e)  {
					w("  Error: \x07" + e.filename + ":" + e.line + ":" + e.column);
					w("    " + e.message);
					if (doneCB) {
						doneCB();
					} else {
						process.exit(1);
					}
				}
			}
		};
	};
	var nextSheet = function() {
		for (var sheet = loader.sheets.shift(); sheet; sheet = loader.sheets.shift()) {
			if (sheet.slice(-5) == ".less") {
				w("Compiling: " + sheet);
				code = fs.readFileSync(sheet, "utf8");
				parser = new(less.Parser)({filename:sheet, paths:[path.dirname(sheet)], relativeUrls:true});
				cssFile = sheet.slice(0,sheet.length-5) + ".css";
				parser.parse(code, report(cssFile));
				return;
			}
		}
		if (doneCB) {
			doneCB();
		}
	};
	nextSheet();
}

function watchFile(file) {
	var readFile;
	var readFileSync;
	var dependencies;
	var watches = [];
	var startDep = function() {
		dependencies = [];
		readFile = fs.readFile;
		readFileSync = fs.readFileSync;
		fs.readFile = function(filename) {
			if (dependencies.indexOf(filename) < 0) {
				dependencies.push(filename);
			}
			return readFile.apply(fs, arguments);
		};
		fs.readFileSync = function(filename) {
			if (dependencies.indexOf(filename) < 0) {
				dependencies.push(filename);
			}
			return readFileSync.apply(fs, arguments);
		};
	};
	var stopDep = function() {
		fs.readFile = readFile;
		fs.readFileSync = readFileSync;
		resetWatches();
	};
	var recompile = function() {
		walker.walk(opt.source, watchFinish);
	};
	var watchChanged = function(filename) {
		// fs.watch 'filename' arg isn't dependable according to docs, so save the
		// original filename used to setup the watch in closure
		return function(event) {
			if (event == "change") {
				w("Re-compiling due to change in '" + filename + "'");
				recompile();
			}
		};
	};
	var resetWatches = function() {
		for (var w in watches) {
			watches[w].close();
		}
		watches = [];
		for (var d in dependencies) {
			watches.push(fs.watch(dependencies[d], watchChanged(dependencies[d])));
		}
	};
	var watchFinish = function(loader, objs) {
		startDep();
		finish(loader, objs, function() {
			stopDep();
		});
	};
	w("Watching '" + opt.source + "' dependencies for changes...");
	recompile();
}



var knownOpts = {
	"enyo": String,
	"output": String,
	"watch": Boolean,
	"help": Boolean
};

var shortHands = {
	"enyo": ['--enyo'],
	"output": ['--output'],
	"w": ['--watch'],
	"h": ['--help'],
	"?": ['--help'],
	"help": ['--help']
};

var opt = nopt(knownOpts, shortHands, process.argv, 2);
opt.source = opt.argv.remain[0];
if (!opt.source || opt.help) {
	printUsage();
	process.exit();
}

walker.init(opt.enyo);
if (opt.watch) {
	watchFile(opt.source);
} else {
	walker.walk(opt.source, finish);
}
