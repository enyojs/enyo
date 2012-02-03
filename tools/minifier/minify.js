var
	fs = require("fs"),
	path = require("path"),
	walker = require("walker"),
	jsp = require("uglify-js").parser,
	pro = require("uglify-js").uglify
	;

options = function(args) {
	var opts = {};
	for (var i=2; i<args.length; i++) {
		var arg = args[i];
		if (arg[0] == "-") {
			var o = arg.slice(1);
			opts[o] = {enyo: 1, output: 1, alias: 1}[o] ? args[++i] : true;
		} else {
			opts.source = arg;
		}
	}
	w(opts);
	w("");
	return opts;
};

function printUsage() {
	w("Enyo 2.0 Minifier");
	w("Flags:")
	w("-no-alias:", "Don't use path macros");
	w("-alias ALIAS:", "Give paths a macroized alias");
	w("-enyo ENYOPATH:", "Path to enyo loader (enyo/enyo.js)");
	w("-output PATH/NAME:", "name of output file, prepend folder paths to change output directory");
	w("-h, -?, -help:", "Show this message");
}

// make a relative path from source to target
function makeRelPath(inSource, inTarget) {
	// node 0.5 has this nice thing, 0.4 does not
	if (path.relative) {
		return path.relative(inSource, inTarget);
	}
	var s,t;
	s = pathSplit(path.resolve(inSource));
	t = pathSplit(path.resolve(inTarget));
	while (s.length && s[0] === t[0]){
		s.shift();
		t.shift();
	}
	for(var i = 0, l = s.length; i < l; i++) {
		t.unshift("..");
	}
	return path.join.apply(null, t);
}

// properly split path based on platform
function pathSplit(inPath) {
	var sep = process.platform == "win32" ? "\\" : "/";
	return inPath.split(sep);
}

buildPathBlock = function(loader) {
	var p$ = [];
	for (var i=0, p; p=loader.packages[i]; i++) {
		if (p.name.indexOf("-") == -1) {
			p$.push(p.name + ': "' + p.folder + '"');
		}
	}
	var p = p$.join(', ');
	return !p ? "" : "\n// minifier: path aliases\n\nenyo.path.addPaths({" + p + "});\n";
};

concatCss = function(loader) {
	w("");
	var blob = "";
	for (var i=0, s; s=loader.sheets[i]; i++) {
		w(s);
		var code = fs.readFileSync(s, "utf8");
		// fix url paths
		code = code.replace(/url\([^)]*\)/g, function(inMatch) {
			// find the url path, ignore quotes in url string
			var urlPath = inMatch.replace(/["']/g, "").slice(4, -1);
			// skip data urls
			if (/^data:/.test(urlPath)) {
				return "url(" + urlPath + ")";
			}
			// get absolute path to referenced asset
			var normalizedUrlPath = path.join(s, "..", urlPath);
			// Make relative asset path to built css
			var relPath = makeRelPath(path.dirname(opt.output || "build"), normalizedUrlPath);
			if (process.platform == "win32") {
				relPath = pathSplit(relPath).join("/");
			}
			return "url(" + relPath + ")";
		});
		blob += "\n/* " + s + " */\n\n" + code + "\n";
	}
	return blob;
};

concatJs = function(loader) {
	w("");
	var blob = "";
	for (var i=0, m; m=loader.modules[i]; i++) {
		if (!opt["no-alias"] && !opt.alias) {
			w("* inserting path aliases");
			blob += buildPathBlock(loader);
			opt["no-alias"] = true;
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
	//
	var css = concatCss(loader);
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
};

w = console.log;

opt = options(process.argv);
w("");

if (opt.help || opt.h || opt["?"]) {
	printUsage();
	process.exit();
}

walker.init(opt.enyo);
walker.walk(opt.source, finish);
