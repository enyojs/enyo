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
	var path = "enyo/tools/minifier/node_modules/less/dist/less-1.7.0.min.js";
	var scripts = document.getElementsByTagName("script");
	for(var i=0; i<scripts.length; i++) {
		if(scripts[i].src.indexOf("enyo/tools/less.js")>-1) {
			// update path relative to this script for extra precision
			path = self.src.replace("enyo/tools/less.js", path);
			break;
		}
	}
	var script = document.createElement('script');
	script.src = path;
	script.charset = "utf-8";
	document.getElementsByTagName('head')[0].appendChild(script);
})();
