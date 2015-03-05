// Client-side less.js configurator / loader
(function() {
	var less = window.less || {};
	if (less.relativeUrls === undefined) {
		less.relativeUrls = true;
	}
	if (less.environment === undefined) {
		less.environment = 'production';
	}
	window.less = less;

	// find the relative path to the less script by finding this script tag and using its src
	var thisScript = document.querySelector('script[src $= \'enyo/tools/less.js\']'),
		src = thisScript ? thisScript.getAttribute('src') : null,
		basePath = src ? src.substring(0, src.length - 7) : 'enyo/tools/',
		script = document.createElement('script');

	script.src = basePath + 'minifier/node_modules/less/dist/less-1.7.0.min.js';
	script.charset = 'utf-8';
	document.getElementsByTagName('head')[0].appendChild(script);
})();