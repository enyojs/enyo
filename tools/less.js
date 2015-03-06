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

	function script (src) {
		var node = document.createElement('script');
		node.src = src;
		node.charset = 'utf-8';
		document.getElementsByTagName('head')[0].appendChild(node);

		return node;
	}

	// find the relative path to the less script by finding this script tag and using its src
	var thisScript = document.querySelector('script[src $= \'enyo/tools/less.js\']'),
		src = thisScript ? thisScript.getAttribute('src') : null,
		basePath = src ? src.substring(0, src.length - 7) : 'enyo/tools/',
		useRI = thisScript && thisScript.hasAttribute('ri'),
		lessJs = useRI ? 'less-1.7.0.ri.min.js' : 'less-1.7.0.min.js';

	script(basePath + 'minifier/node_modules/less/dist/' + lessJs);
	if (useRI) {
		var riSrc = basePath + 'minifier/node_modules/less-plugin-resolution-independence/lib/resolution-independence.js'; 
		script(riSrc).onload = function () {
			var ri = new enyoLessRiPlugin();
			less.plugins = [ri];
		};
	}
})();