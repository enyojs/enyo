(function() {
	// enyo uses information from the script tag that loads
	// this bootstrap file
	var main = "enyo"
	
	enyo = window.enyo || {};
	enyo.args = enyo.args || {};
	enyo.args.main = main;

	var thisScript = main + ".js";

	// locate the script tag whose src attribute ends with "inName"
	// convert attributes of that tag to enyo.args
	// return the path to the script
	// FIXME: refactor
	var locateScript = function(inName) {
		var scripts = document.getElementsByTagName("script");
		for (var i=0, s, src, l=inName.length; s=scripts[i]; i++) {
			src = s.getAttribute("src") || "";
			if (src.slice(-l) == inName) {
				glomArgs(s);
				return src.slice(0, -l -1);
			}
		}
	};
	
	// all attributes of the bootstrap script tag become enyo.args
	var glomArgs = function(s) {
		for (var it, i=0, l=s.attributes.length; i<l; i++) {
			it = s.attributes.item(i);
			enyo.args[it.nodeName] = it.nodeValue;
		}
	};

	// infer the framework path from the document, unless the user
	// has specified one explicitly also, acquire args from framework
	// script tag
	enyo.args.root = (enyo.args.root || locateScript(thisScript)).replace("/source", "");
})();