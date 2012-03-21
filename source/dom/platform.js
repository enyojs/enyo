/**
	Determines OS versions of platforms that need special treatment
	Can have one of the following properties:

	* android
	* ie
	* ios
	* webos

	If the property is defined, it will have the value of the major version number of the platform

	Example:

		// android 2 does not have 3d css
		if (enyo.platform.android < 3) {
			t = "translate(30px, 50px)";
		} else {
			t = "translate3d(30px, 50px, 0)";
		}
		this.applyStyle("-webkit-transform", t);
*/
enyo.platform = {};

//* @protected
(function() {
	var ua = navigator.userAgent;
	var ep = enyo.platform;
	var platforms = [
		// Android 2 - 4
		{platform: "android", regex: /Android (\d+)/},
		// Kindle Fire
		// Force version to 2, (desktop mode does not list android version)
		{platform: "android", regex: /Silk\//, forceVersion: 2},
		// IE 8 - 10
		{platform: "ie", regex: /MSIE (\d+)/},
		// iOS 3 - 5
		// Apple likes to make this complicated
		{platform: "ios", regex: /iP(?:hone|ad;(?: U;)? CPU) OS (\d+)/},
		// webOS 1 - 3
		{platform: "webos", regex: /(?:web|hpw)OS\/(\d+)/}
	];
	for (var i = 0, p, m, v; p = platforms[i]; i++) {
		m = p.regex.exec(ua);
		if (m) {
			if (p.forceVersion) {
				v = p.forceVersion;
			} else {
				v = Number(m[1]);
			}
			ep[p.platform] = v;
			break;
		}
	}
	// these platforms only allow one argument for console.log
	enyo.dumbConsole = Boolean(ep.android || ep.ios || ep.webos);
})();
