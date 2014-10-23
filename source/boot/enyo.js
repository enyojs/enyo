(function () {
	// enyo can use information from the script tag that loads this bootstrap file
	var thisScript = "enyo.js";

	/* global enyo:true */
	/**
		Contains the core functionality of the Enyo framework.

		@namespace enyo
	*/
	enyo = window.enyo || {options: {}};

	/**
	* @private
	*/
	enyo.locateScript = function (inName) {
		var scripts = document.getElementsByTagName("script");
		for (var i=scripts.length-1, s, src, l=inName.length; (i>=0) && (s=scripts[i]); i--) {
			if (!s.located) {
				src = s.getAttribute("src") || "";
				if (src.slice(-l) == inName) {
					s.located = true;
					return {path: src.slice(0, Math.max(0, src.lastIndexOf("/"))), node: s};
				}
			}
		}
	};
	
	/**
	* Optional options to pass to the framework.
	*
	* @name enyo.args
	* @type {Object}
	* @public
	*/
	enyo.args = enyo.args || {};

	var tag = enyo.locateScript(thisScript);
	if (tag) {
		// infer the framework path from the document, unless the user has specified one explicitly
		enyo.args.root = (enyo.args.root || tag.path).replace("/source", "");
		// all attributes of the bootstrap script tag become enyo.args
		for (var i=0, al = tag.node.attributes.length, it; (i < al) && (it = tag.node.attributes.item(i)); i++) {
			enyo.args[it.nodeName] = it.value;
		}
	}
})();