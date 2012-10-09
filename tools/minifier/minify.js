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
	w("Enyo 2.0 Minifier");
	w("Flags:");
	w("-no-less:", "Don't compile less; instad substitute css for less");
	w("-no-alias:", "Don't use path macros");
	w("-alias:", "Give paths a macroized alias");
	w("-enyo ENYOPATH:", "Path to enyo loader (enyo/enyo.js)");
	w("-output PATH/NAME:", "name of output file, prepend folder paths to change output directory");
	w("-h, -?, -help:", "Show this message");
}

// properly split path based on platform
function pathSplit(inPath) {
	var sep = process.platform == "win32" ? "\\" : "/";
	return inPath.split(sep);
}

buildPathBlock = function(loader) {
	var p$ = [];
	for (var i=0, p; (p=loader.packages[i]); i++) {
		if (p.name.indexOf("-") == -1) {
			p$.push(p.name + ': "' + p.folder + '"');
		}
	}
	p = p$.join(', ');
	return !p ? "" : "\n// minifier: path aliases\n\nenyo.path.addPaths({" + p + "});\n";
};

concatCss = function(loader, doneCB) {
	w("");
	var blob = "";
	var addToBlob = function(sheet, code) {
		// fix url paths
		code = code.replace(/url\([^)]*\)/g, function(inMatch) {
			// find the url path, ignore quotes in url string
			var matches = /url\s*\(\s*(('([^']*)')|("([^"]*)")|([^'"]*))\s*\)/.exec(inMatch);
			var urlPath = matches[3] || matches[5] || matches[6];
			// skip data urls
			if (/^data:/.test(urlPath)) {
				return "url(" + urlPath + ")";
			}
			// get absolute path to referenced asset
			var normalizedUrlPath = path.join(sheet, "..", urlPath);
			// Make relative asset path to built css
			var relPath = path.relative(path.dirname(opt.output || "build"), normalizedUrlPath);
			if (process.platform == "win32") {
				relPath = pathSplit(relPath).join("/");
			}
			return "url(" + relPath + ")";
		});
		blob += "\n/* " + sheet + " */\n\n" + code + "\n";
	}
	// Pops one sheet off the sheets[] array, reads (and parses if less), and then
	// recurses again from the async callback until no sheets left, then calls doneCB
	var readAndParse = function(sheets) {
		var sheet = sheets.shift();
		if (sheet) {
			w(sheet);
			var isLess = (sheet.slice(-4) == "less");
			if (isLess && (opt.less !== undefined)) {
				sheet = sheet.slice(0, sheet.length-4) + "css";
				isLess = false;
				w(" (Substituting CSS: " + sheet + ")");
			}
			var code = fs.readFileSync(sheet, "utf8");
			if (isLess) {
				var parser = new(less.Parser)({filename:sheet, paths:[path.dirname(sheet)]});
				parser.parse(code, function (err, tree) {
					if (err) {
						console.error(err);
					} else {
						addToBlob(sheet, tree.toCSS());
					}
					readAndParse(sheets);
				});
			} else {
				addToBlob(sheet, code);
				readAndParse(sheets);
			}
		} else {
			doneCB(blob);
		}
	}
	readAndParse(loader.sheets);
};

concatJs = function(loader) {
	w("");
	var blob = "";
	for (var i=0, m; (m=loader.modules[i]); i++) {
		if (typeof opt.alias === 'undefined' || opt.alias) {
			w("* inserting path aliases");
			blob += buildPathBlock(loader);
			opt.alias = false;
		}
		w(m.path);
		blob += "\n// " + m.rawPath + "\n\n" + compressJsFile(m.path) + "\n";
		if (opt.alias == m.rawPath) {
			w("* inserting path aliases");
			blob += buildPathBlock(loader);
		}
	}
	return blob;
};

compress = function(inCode) {
	var ast = jsp.parse(inCode); // parse code and get the initial AST
	ast = pro.ast_mangle(ast); // get a new AST with mangled names
	ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
	return pro.gen_code(ast, {indent_level:0, beautify: !opt.aggro, ascii_only:true}); // compressed code here
};

compressJsFile = function(inPath) {
	var code = fs.readFileSync(inPath, "utf8");
	return compress(code);
};

finish = function(loader) {
	//w(loader.packages);
	//w('');
	//
	var output = opt.output || "build";
	var outfolder = path.dirname(output);
	var exists = fs.existsSync || path.existsSync;
	if (outfolder != "." && !exists(outfolder)) {
		fs.mkdirSync(outfolder);
	}
	// Unfortunately, less parsing is asynchronous, so concatCSS is now as well
	concatCss(loader, function(css) {
		if (css.length) {
			w("");
			fs.writeFileSync(output + ".css", css, "utf8");
		}
		//
		var js = concatJs(loader);
		/*
		if (css.length) {
			js += "\n// " + "minifier: load css" + "\n\n";
			js += 'enyo.machine.sheet("' + output + '.css");\n';
		}
		*/
		if (js.length) {
			w("");
			fs.writeFileSync(output + ".js", js, "utf8");
		}
		//
		w("");
		w("done.");
		w("");
	});
};

w = console.log;

var knownOpts = {
  "alias": Boolean,
  "enyo": String,
  "output": String,
  "help": Boolean
};

var shortHands = {
  "alias": ['--alias'],
  "enyo": ['--enyo'],
  "output": ['--output'],
  "h": ['--help'],
  "?": ['--help'],
  "help": ['--help']
};

opt = nopt(knownOpts, shortHands, process.argv, 2);
opt.source = opt.argv.remain[0];
w(opt);
w("");

w("");

if (opt.help) {
	printUsage();
	process.exit();
}

walker.init(opt.enyo);
walker.walk(opt.source, finish);
