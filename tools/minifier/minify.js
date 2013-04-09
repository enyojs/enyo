(function() {
	/* jshint node: true */
	var
		fs = require("fs"),
		path = require("path"),
		walker = require("walker"),
		uglify = require("uglify-js"),
		nopt = require("nopt"),
		less = require("less");

	var basename = path.basename(__filename),
		w = console.log,
		e = console.error,
		opt;

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
		w("--beautify:", "Output pretty version that's less compressed but has code on separate lines");
		w("-h, -?, -help:", "Show this message");
	}

	// properly split path based on platform
	function pathSplit(inPath) {
		var sep = process.platform == "win32" ? "\\" : "/";
		return inPath.split(sep);
	}

	function buildPathBlock(loader) {
		var p$ = [];
		for (var i=0, p; (p=loader.packages[i]); i++) {
			if (p.name.indexOf("-") == -1) {
				p$.push(p.name + ': "' + p.folder + '"');
			}
		}
		p = p$.join(', ');
		return !p ? "" : "// minifier: path aliases\nenyo.path.addPaths({" + p + "});\n";
	}

	function concatCss(loader, doneCB) {
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
				// skip an external link
				if (/^http(:?s)?:/.test(urlPath)) {
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
		};
		// Pops one sheet off the sheets[] array, reads (and parses if less), and then
		// recurses again from the async callback until no sheets left, then calls doneCB
		function readAndParse(sheets) {
			var sheet = sheets.shift();
			if (sheet) {
				w(sheet);
				var isLess = (sheet.slice(-4) == "less");
				if (isLess && (opt.less !== true)) {
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
	}

	var concatJs = function(loader) {
		w("");
		var blob = "";
		for (var i=0, m; (m=loader.modules[i]); i++) {
			if (typeof opt.alias === 'undefined' || opt.alias) {
				w("* inserting path aliases");
				blob += buildPathBlock(loader);
				opt.alias = false;
			}
			w(m.path);
			blob += "\n// " + m.rawPath + "\n" + compressJsFile(m.path) + "\n";
			if (opt.alias == m.rawPath) {
				w("* inserting path aliases");
				blob += buildPathBlock(loader);
			}
		}
		return blob;
	};

	var compressJsFile = function(inPath) {
		var outputOpts = {
//			beautify: false,
//			indent_level: 4,
			ascii_only: true
		};
		if (opt.beautify) {
			outputOpts.beautify = true;
			outputOpts.indent_level = 4;
		}
		var result = uglify.minify(inPath, {output: outputOpts});
		return result.code;
	};

	var finish = function(loader) {
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

			// required to properly terminate a
			// node.process.fork() call, as defined by
			// <http://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options>
			process.exit(0);
		});
	};

	var knownOpts = {
		"alias": Boolean,
		"enyo": String,
		"output": String,
		"help": Boolean,
		"beautify": Boolean
	};

	var shortHands = {
		"alias": ['--alias'],
		"enyo": ['--enyo'],
		"output": ['--output'],
		"h": ['--help'],
		"?": ['--help'],
		"help": ['--help'],
		"beautify": ['--beautify']
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

	// Send message to parent node process, if any
	process.on('uncaughtException', function (err) {
		e(err.stack);
		if (process.send) {
			// only available if parent-process is node
			process.send({error: err});
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

	walker.init(opt.enyo);
	walker.walk(opt.source, finish);

})();