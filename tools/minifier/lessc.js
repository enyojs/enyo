var
	fs = require("fs"),
	path = require("path"),
	walker = require("walker"),
	jsp = require("uglify-js").parser,
	pro = require("uglify-js").uglify,
	nopt = require("nopt"),
	less = require("less")
	;

// Shimming path.relative with 0.8.8's version if it doesn't exist
if(!path.relative){
  path.relative = require('./path-relative-shim').relative;
}

function printUsage() {
	w("Enyo Less->CSS Compiler");
	w("-enyo ENYOPATH:", "Path to enyo loader (enyo/enyo.js)");
	w("-output PATH/NAME:", "name of output file, prepend folder paths to change output directory");
	w("-h, -?, -help:", "Show this message");
}

function finish(loader) {
	for (var i=0, sheet; (sheet=loader.sheets[i]); i++) {
		if (sheet.slice(-5) == ".less") {
			w(sheet);
			var code = fs.readFileSync(sheet, "utf8");
			var parser = new(less.Parser)({filename:sheet, paths:[path.dirname(sheet)]});
			var cssFile = sheet.slice(0,sheet.length-5) + ".css";
			parser.parse(code, function (err, tree) {
				if (err) {
					console.error(err);
				} else {
					var css = 
						"/* WARNING: This is a generated file for backward-compatibility.  Most      */\n" +
						"/* usrs should instead modify LESS files.  If you choose to edit this CSS   */\n" +
						"/* directly rather than LESS files, you should make sure less.xx.yy.min.js  */\n" +
						"/* is commented out in your debug.html, and run deploy.sh/bat using the     */\n" +
						"/* '-c' flag to disable LESS compilation.  This will force the loader and   */\n" +
						"/* minifier to fall back to using CSS files in place of the same-name       */\n" +
						"/* LESS file.                                                               */\n" +
						"\n" + tree.toCSS()
					fs.writeFileSync(cssFile, css, "utf8");
				}
			});
		}
	}
}

w = console.log;

var knownOpts = {
  "enyo": String,
  "output": String,
  "help": Boolean
};

var shortHands = {
  "enyo": ['--enyo'],
  "output": ['--output'],
  "h": ['--help'],
  "?": ['--help'],
  "help": ['--help']
};

opt = nopt(knownOpts, shortHands, process.argv, 2);
opt.source = opt.argv.remain[0];
//w(opt);
//w("");

w("");

if (opt.help) {
	printUsage();
	process.exit();
}

walker.init(opt.enyo);
walker.walk(opt.source, finish);

