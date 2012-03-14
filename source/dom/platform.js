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
	var ie, a, ios, w;
	ie = n.match(/MSIE (\d+)/);
	if (ie) {
		enyo.platform.ie = ie[1];
	}
	a = n.match(/Android (\d+)/);
	if (a) {
		enyo.platform.android = a[1];
	}
	ios = n.match(/iP(?:[oa]d|hone).*OS (\d+)/);
	if (ios) {
		enyo.platform.ios = ios[1];
	}
	w = n.match(/(?:web|hpw)OS\/(\d+)/);
	if (w) {
		enyo.platform.webos = w[1];
	}
	// these platforms only allow one argument for console.log
	enyo.dumbConsole = Boolean(enyo.platform.android || enyo.platform.ios || enyo.platform.webos);
})();
