// machine for a loader instance
enyo.machine = {
	sheet: function(s) {
		document.write('<link href="' + s + '" media="screen" rel="stylesheet" type="text/css" />');
	},
	script: function(inSrc, onLoad, onError) {
		document.write('<scri' + 'pt src="' + inSrc + '"' + (onLoad ? ' onload="' + onLoad + '"' : '') + (onError ? ' onerror="' + onError + '"' : '') + '></scri' + 'pt>');
	},
	inject: function(inCode) {
		document.write('<script type="text/javascript">' + inCode + "</script>");
	}
};

// create a dependency processor using our script machine
enyo.loader = new enyo.loaderFactory(enyo.machine);

// dependency API uses enyo loader
enyo.depends = function() {
	var ldr = enyo.loader;
	if (!ldr.packageFolder) {
		var tag = enyo.locateScript("package.js");
		if (tag && tag.path) {
			ldr.aliasPackage(tag.path);
			ldr.packageFolder = tag.path + "/";
			//console.log("detected PACKAGEFOLDER [" + ldr.packageFolder + "]");
		}
	}
	ldr.load.apply(ldr, arguments);
};

// predefined path aliases
enyo.path.addPaths({
	enyo: enyo.args.root,
	lib: enyo.args.root + "/../lib"
});
