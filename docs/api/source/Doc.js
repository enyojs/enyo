enyo.kind({
	name: "Doc",
	kind: "Component",
	events: {
		onReport: "",
		onFinish: ""
	},
	components: [
		{name: "walker", kind: "Walker", onReport: "walkerReport", onFinish: "walkerFinish"}
	],
	walkerReport: function(inSender, inAction, inName) {
		this.doReport(inAction, inName);
		//this.$.console.setContent("<b>" + inAction + (inName ? "</b>: <span style='color: green;'>" + inName + "</span>" : ""));
	},
	walkEnyo: function(inPath) {
		//this.$.walker.walk(enyo.path.rewrite("$enyo/core/debug-depends"));
		this.$.walker.walk(inPath);
	},
	walkerFinish: function() {
		this.doFinish();
	},
	info: function() {
		this.$.toc.setContent(this.buildToc());
		this.$.index.setContent(this.buildIndex());
		this.selectTopic(window.location.hash.slice(1) || "enyo.Component");
	},
	relativizePath: function(inPath) {
		// remove crufty part of path
		var s = inPath.indexOf("source");
		return inPath.slice(s + 7);
	},
	// build a map of packages to modules
	buildModuleList: function() {
		var map = {};
		for (var n in this.$.walker.modules) {
		//for (var i=0, m; m = this.$.walker.modules[i]; i++) {
			var m = this.$.walker.modules[n];
			var p = m.package.toLowerCase();
			if (!map[p]) {
				map[p] = {
					package: m.package,
					modules: []
				}
			}
			var n = m.path.split("/").pop();
			// remove crufty part of path
			var module = this.relativizePath(m.path);
			var a = '<a id="toc_' + module + '" href="#' + module + '">' + n + '</a>';
			map[p].modules.push(a);
		}
		return map;
	},
	buildToc: function() {
		var map = this.buildModuleList();
		var index = Object.keys(map);
		// index is lower-cased for sorting
		//index.sort();
		// remap index
		for (var i=0, n, m; n=index[i], m=map[n]; i++) {
			var html = "<ul><li>" + m.modules.join("</li><li>") + "</li></ul>";
			html = '<li>' + m.package + html + '</li>';
			index[i] = html;
		}
		// build a toc-ish thing
		var html = [];
		html.push("<ul>" + index.join("") + "</ul>");
		return html.join('');
	},
	buildIndex: function() {
		var index = Module.topicIndex2;
		// case-insensitive sort
		index.sort(function(inA, inB) {
			var a = inA.toLowerCase(), b = inB.toLowerCase();
			if (a < b) return -1;
			if (a > b) return 1;
			return 0;
		});
		// collate by first letter 
		var map = {};
		for (var i=0, t; t=index[i]; i++) {
			// collate on the second term, if namespaced in enyo [enyo.foo]
			var fl = t.split(".");
			fl = (fl[0] == "enyo") ? fl[1] || fl[0] : t;
			// collate by UpperCased first letter in name
			fl = (fl[0]).toUpperCase();
			//console.log(t, fl);
			if (!map[fl]) {
				map[fl] = [];
			}
			map[fl].push(t);
		}
		// output index
		var html = [];
		for (var i=-1; i<26; i++) {
			//var alpha = i >= 0 ? String.fromCharCode(65 + i) : '/';
			var alpha = i >= 0 ? String.fromCharCode(65 + i) : null;
			var list = map[alpha];
			if (list) {
				html.push("<h2>" + alpha + "</h2><ul>");
				for (var j=0, t; t=list[j]; j++) {
					html.push('<li id="idx_' + t + '"><a href="#' + t + '">' + t + '</a></li>');
				}
				html.push("</ul>");
			}
		}
		return html.join("");
	}
});
