var
	walker = require("walker"),
	fs = require("fs"),
	jsp = require("uglify-js").parser,
	pro = require("uglify-js").uglify
	;

options = function(args) {
	var opts = {};
	//while (i < args.length) {
	for (var i=2; i<args.length; i++) {
		var arg = args[i];
		if (arg[0] == "-") {
			opts[arg.slice(1)] = true;
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
		p$.push(p.name + ': "' + p.folder + '"');
	}
	return "enyo.path.addPaths({" + p$.join(', ') + "});\n";
};

compress = function(inCode) {
	var ast = jsp.parse(inCode); // parse code and get the initial AST
	ast = pro.ast_mangle(ast); // get a new AST with mangled names
	ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
	return pro.gen_code(ast/*, {indent_level:0, beautify:true, ascii_only:true}*/); // compressed code here
};

concatJs = function(loader) {
	w("");
	var blob = "";
	for (var i=0, m; m=loader.modules[i]; i++) {
		w(m.path);
		var code = fs.readFileSync(m.path, "utf8");
		code = compress(code);
		blob += "\n// " + m.rawPath + "\n\n" + code + "\n";
	}
	return blob;
};

finish = function(loader) {
	//w(loader.packages);
	//w('');
	//
	var blob = "";
	if (opt["no-alias"]) {
		w("* skipping alias block");
	} else {
		blob += buildPathBlock(loader);
	}
	blob += concatJs(loader);
	//
	w("");
	fs.writeFileSync("build.js", blob, "utf8");
	w("done.");
	w("");
};

w = console.log;
opt = options(process.argv);
w("");
walker.walk("test-depends.js", finish);
