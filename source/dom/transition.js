enyo.dom.transition = (enyo.platform.ios || enyo.platform.android || enyo.platform.chrome || enyo.platform.androidChrome || enyo.platform.safari)
	? "-webkit-transition"
	: (enyo.platform.firefox || enyo.platform.firefoxOS || enyo.platform.androidFirefox)
		? "-moz-transition"
		: "transition";