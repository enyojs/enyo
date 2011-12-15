(function() {
	// enyo can use information from the script tag that loads this bootstrap file
	var thisScript = "enyo.js";

	enyo = window.enyo || {};

	enyo.locateScript = function(inName) {
		var scripts = document.getElementsByTagName("script");
		for (var i=scripts.length-1, s, src, l=inName.length; (i>=0) && (s=scripts[i]); i--) {
			src = s.getAttribute("src") || "";
			if (src.slice(-l) == inName) {
				return {path: src.slice(0, -l -1), node: s};
			}
		}
	};

	enyo.args = enyo.args || {};

	var tag = enyo.locateScript(thisScript);
	if (tag) {
		// infer the framework path from the document, unless the user has specified one explicitly
		var root = enyo.args.root = (enyo.args.root || tag.path).replace("/source", "");
		// all attributes of the bootstrap script tag become enyo.args
		for (var i=0/*, l=tag.node.attributes.length*/, it; /*i<l &&*/ (it = tag.node.attributes.item(i)); i++) {
			enyo.args[it.nodeName] = it.nodeValue;
		}
	}

	var script = function(inSrc) {
		document.write('<scri' + 'pt src="' + root + "/source/boot/" + inSrc + '"></scri' + 'pt>');
	};

	script("loader.js");
	script("boot.js");
	script("source.js");
})();