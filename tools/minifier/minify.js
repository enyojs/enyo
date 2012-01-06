var
	walker = require("walker"),
	fs = require("fs"),
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

buildPathBlock = function(loader) {
	var p$ = [];
	for (var i=0, p; p=loader.packages[i]; i++) {
		if (p.name.indexOf("-") == -1) {
			p$.push(p.name + ': "' + p.folder + '"');
		}
	}
	return "enyo.path.addPaths({" + p$.join(', ') + "});\n";
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

concatCss = function(loader) {
	w("");
	var blob = "";
	for (var i=0, s; s=loader.sheets[i]; i++) {
		w(s);
		var code = fs.readFileSync(s, "utf8");
		blob += "\n/* " + s + " */\n\n" + code + "\n";
	}
	return blob;
};

concatJs = function(loader) {
	w("");
	var blob = "";
	for (var i=0, m; m=loader.modules[i]; i++) {
	}
	return blob;
};

concatJs = function(loader) {
	w("");
	var blob = "";
	for (var i=0, m; m=loader.modules[i]; i++) {
		if (!opt["no-alias"] && !opt.alias) {
			w("* inserting path aliases");
			blob += aliases(loader);
			opt["no-alias"] = true;
		}
		w(m.path);
		blob += "\n// " + m.rawPath + "\n\n" + compressJsFile(m.path) + "\n";
		if (opt.alias == m.rawPath) {
			w("* inserting path aliases");
			blob += aliases(loader);
		}
	}
	return blob;
};

aliases = function(loader) {
	var blob = "\n// " + "minifier: path aliases" + "\n\n";
	return blob + buildPathBlock(loader);
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

walker.init(opt.enyo);
walker.walk(opt.source, finish);
