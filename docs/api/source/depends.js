(function(){
	var locateScript = function(inName) {
		var scripts = document.getElementsByTagName("script");
		for (var s, src, l=inName.length, i=scripts.length-1; s=scripts[i]; i--) {
			src = s.getAttribute("src") || "";
			console.log(src.slice(-l));
			if (src.slice(-l) == inName) {
				return src.slice(0, -l -1);
			}
		}
	};
	var s = locateScript("depends.js");
	console.log("depends home: ", s);
	enyo.loader.packageFolder = s + "/";
})();

enyo.depends(
	"$lib/fu",
	"$lib/parser",
	"$lib/analyzer",
	"$lib/utils/macroize.js",
	"$lib/foss/showdown-v0.9/compressed/showdown.js",
	"css/app.css",
	"css/doc.css",
	"Formatter.js",
	"Doc.js",
	"App.js"
);
