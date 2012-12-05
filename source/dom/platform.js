/**
	Determines OS versions of platforms that need special treatment.
	Can have one of the following properties:

	* android
	* androidChrome (Chrome on Android, standard starting in 4.1)
	* androidFirefox
	* ie
	* ios
	* webos
	* blackberry
	* safari (desktop version)
	* chrome (desktop version)
	* firefox (desktop version)

	If the property is defined, its value will be the major version	number
	of the platform.

	Example:

		// android 2 does not have 3d css
		if (enyo.platform.android < 3) {
			t = "translate(30px, 50px)";
		} else {
			t = "translate3d(30px, 50px, 0)";
		}
		this.applyStyle("-webkit-transform", t);
*/
enyo.platform = {
	//* True if the platform has native single finger events
	touch: Boolean(("ontouchstart" in window) || window.navigator.msMaxTouchPoints),
	//* True if the platform has native double finger events
	gesture: Boolean(("ongesturestart" in window) || window.navigator.msMaxTouchPoints)
};

//* @protected
(function() {
	var ua = navigator.userAgent;
	var ep = enyo.platform;
	var platforms = [
		// Android 4+ using Chrome
		{platform: "androidChrome", regex: /Android .* Chrome\/(\d+)[.\d]+/},
		// Android 2 - 4
		{platform: "android", regex: /Android (\d+)/},
		// Kindle Fire
		// Force version to 2, (desktop mode does not list android version)
		{platform: "android", regex: /Silk\/1./, forceVersion: 2, extra: {silk: 1}},
		// Kindle Fire HD
		// Force version to 4
		{platform: "android", regex: /Silk\/2./, forceVersion: 4, extra: {silk: 2}},
		// IE 8 - 10
		{platform: "ie", regex: /MSIE (\d+)/},
		// iOS 3 - 5
		// Apple likes to make this complicated
		{platform: "ios", regex: /iP(?:hone|ad;(?: U;)? CPU) OS (\d+)/},
		// webOS 1 - 3
		{platform: "webos", regex: /(?:web|hpw)OS\/(\d+)/},
		// desktop Safari
		{platform: "safari", regex: /Version\/(\d+)[.\d]+\s+Safari/},
		// desktop Chrome
		{platform: "chrome", regex: /Chrome\/(\d+)[.\d]+/},
		// Firefox on Android
		{platform: "androidFirefox", regex: /Android;.*Firefox\/(\d+)/},
		// desktop Firefox
		{platform: "firefox", regex: /Firefox\/(\d+)/},
		// Blackberry 10+
		{platform: "blackberry", regex: /BB1\d;.*Version\/(\d+\.\d+)/}
	];
	for (var i = 0, p, m, v; (p = platforms[i]); i++) {
		m = p.regex.exec(ua);
		if (m) {
			if (p.forceVersion) {
				v = p.forceVersion;
			} else {
				v = Number(m[1]);
			}
			ep[p.platform] = v;
			if (p.extra) {
				enyo.mixin(ep, p.extra);
			}
			break;
		}
	}
	// these platforms only allow one argument for console.log
	enyo.dumbConsole = Boolean(ep.android || ep.ios || ep.webos);
})();
