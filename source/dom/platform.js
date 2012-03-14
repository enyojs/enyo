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
	var n = navigator.userAgent;
	var ep = enyo.platform;
	var ie, a, ios, w;
	// IE 8 - 10
	ie = n.match(/MSIE (\d+)/);
	if (ie) {
		ep.ie = Number(ie[1]);
	}
	// Android 2 - 4
	a = n.match(/Android (\d+)/);
	if (a) {
		ep.android = Number(a[1]);
	}
	// iOS 3 - 5
	// Apple likes to make this complicated
	ios = n.match(/iP(?:hone|ad;(?: U;)? CPU) OS (\d+)/);
	if (ios) {
		ep.ios = Number(ios[1]);
	}
	// webOS 1 - 3
	w = n.match(/(?:web|hpw)OS\/(\d+)/);
	if (w) {
		ep.webos = Number(w[1]);
	}
	// these platforms only allow one argument for console.log
	enyo.dumbConsole = Boolean(ep.android || ep.ios || ep.webos);
})();
