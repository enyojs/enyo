// Client-side less.js configurator / loader
(function() {
	var less = window.less || {};
	if (less.relativeUrls === undefined) {
		less.relativeUrls = true;
	}
	if (less.environment === undefined) {
		less.environment = "production";
	}
	window.less = less;
	var path = "enyo/tools/minifier/node_modules/less/dist/less-1.3.3.min.js";
	var self = document.getElementById("less-loader");
	if(self) {
		// optionally update path relative to this script for extra precision
		path = self.src.replace("enyo/tools/less.js", path);
	}
	var script = document.createElement('script');
	script.src = path;
	script.charset = "utf-8";
	document.getElementsByTagName('head')[0].appendChild(script);
})();
