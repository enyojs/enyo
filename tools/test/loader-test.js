var
	walker = require("walker")
	;

w = console.log;

finish = function(loader) {
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
	w("");
};

walker.walk("test-depends.js", finish);
