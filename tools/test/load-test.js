var fs = require("fs");

//
// setup DOM-like sandbox
//

var window = {};

var script = function(inPath) {
	eval(fs.readFileSync(inPath, "utf8"));
};

script("/www/hp/enyo/x-git/enyo/boot/loader.js");

//

enyo.path.addPaths({
	enyo: "/www/hp/enyo/x-git/enyo",
	lib: "/www/hp/enyo/x-git/lib"
});

var loader = new enyo.loaderFactory({
	script: function() {},
	sheet: function() {}
});

enyo.depends = function() {
	loader.load.apply(loader, arguments);
};

loader.loadPackage = function(inScript) {
	script(inScript);
};

w = function(m) {
	console.log(m);
};

loader.finish = function() {
	w("");
	w("== Modules ==");
	w("");
	var p = '';
	for (var i in loader.modules) {
		var m = loader.modules[i];
		if (p != m.package) {
			w("[" + (m.package || "(no package)")+ "]");
			p = m.package;
		}
		w("   " + m.rawPath + " (" + m.path + ")");
	}
	w("");
	w("== Style Sheets ==");
	w("");
	for (var i in loader.sheets) {
		var s = loader.sheets[i];
		w(s);
	}
};

script("test-depends.js");
