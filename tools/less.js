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
	var script = document.createElement('script');
	script.src = "enyo/tools/minifier/node_modules/less/dist/less-1.7.0.min.js";
	script.charset = "utf-8";
	document.getElementsByTagName('head')[0].appendChild(script);
})();
