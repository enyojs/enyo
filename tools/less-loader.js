// Client-side less.js configurator / loader
(function() {
	var less = window.less || {};
	less.plugins = [];
	if (less.relativeUrls === undefined) {
		less.relativeUrls = true;
	}
	if (less.environment === undefined) {
		less.environment = "production";
	}
	window.less = less;
	var script = document.createElement('script');
	script.src = "enyo/tools/minifier/node_modules/less/dist/less-1.7.0.ri.min.js";
	script.charset = "utf-8";
	document.getElementsByTagName('head')[0].appendChild(script);

	script = document.createElement('script');
	script.src = "enyo/tools/minifier/node_modules/less-plugin-resolution-independence/lib/resolution-independence.js";
	script.charset = "utf-8";
	script.onload = function () {
		var ri = new enyoLessRiPlugin();
		less.plugins.push(ri);
	}
	document.getElementsByTagName('head')[0].appendChild(script);	
	
	script = document.createElement('script');
	script.src = "enyo/tools/minifier/node_modules/less-plugin-prefixly/lib/prefixly.js";
	script.charset = "utf-8";
	script.onload = function () {
		var pfx = new enyoLessPrefixlyPlugin();
		less.plugins.push(pfx);
	}
	document.getElementsByTagName('head')[0].appendChild(script);
	
})();
