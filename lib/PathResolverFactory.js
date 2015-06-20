

var PathResolverFactory = module.exports = function() {
	this.paths = {};
	this.pathNames = [];
};

PathResolverFactory.prototype = {
	addPath: function(inName, inPath) {
		this.paths[inName] = inPath;
		this.pathNames.push(inName);
		this.pathNames.sort(function(a, b) {
			return b.length - a.length;
		});
		return inPath;
	},
	addPaths: function(inPaths) {
		if (inPaths) {
			for (var n in inPaths) {
				this.addPath(n, inPaths[n]);
			}
		}
	},
	includeTrailingSlash: function(inPath) {
		return (inPath && inPath.slice(-1) !== "/") ? inPath + "/" : inPath;
	},
	// replace macros of the form $pathname with the mapped value of paths.pathname
	rewrite: function (inPath) {
		var working, its = this.includeTrailingSlash, paths = this.paths;
		var fn = function(macro, name) {
			working = true;
			return its(paths[name]) || '';
		};
		var result = inPath;
		do {
			working = false;
			for (var i=0; i<this.pathNames.length; i++) {
				var regex = new RegExp("\\$(" + this.pathNames[i] + ")(\\/)?", "g");
				result = result.replace(regex, fn);
			}
		} while (working);
		return result;
	}
};
