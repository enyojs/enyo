// TODOC
(function(){
	// API is non-standard, so what enyo exposes may vary from 
	// web documentation for various browsers
	// in particular, enyo.requestAnimationFrame takes no arguments,
	// and the callback receives no arguments
	var builtin = window.webkitRequestAnimationFrame;
	enyo.requestAnimationFrame = builtin ? enyo.bind(window, builtin) :
		function(inCallback) {
			return window.setTimeout(inCallback, Math.round(1000/60));
		};
	//
	// Note: (we have requested to change the native implementation to do this)
	// first return value of webkitRequestAnimationFrame is 0 and a call 
	// to webkitCancelRequestAnimationFrame with no arguments will cancel this.
	// To avoid this and to allow for a boolean test of the return value,
	// make 1 bogus call so the first used return value of webkitRequestAnimationFrame is > 0.
	// (we choose to do this rather than wrapping the native function to avoid the overhead)
	//
	if (builtin) {
		var f = webkitRequestAnimationFrame(enyo.nop);
		webkitCancelRequestAnimationFrame(f);
	}
	//
	builtin = window.webkitCancelRequestAnimationFrame || window.clearTimeout;
	// Note: IE8 clearTimeout cannot be called via .apply so don't use enyo.bind.
	//enyo.cancelRequestAnimationFrame = enyo.bind(window, builtin);
	enyo.cancelRequestAnimationFrame = function(c) {
		return builtin(c);
	};
})();

enyo.easing = {
	cubicIn: function(n) {
		return Math.pow(n, 3);
	},
	cubicOut: function(n) {
		return Math.pow(n - 1, 3) + 1;
	},
	expoOut: function(n) {
		return (n == 1) ? 1 : (-1 * Math.pow(2, -10 * n) + 1);
	},
	quadInOut: function(n){
		n = n * 2;
		if (n < 1) {
			return Math.pow(n, 2) / 2;
		}
		return -1 * ((--n) * (n - 2) - 1) / 2;
	},
	linear: function(n) {
		return n;
	}
};

enyo.easedLerp = function(inT0, inDuration, inEasing) {
	var lerp = (new Date().getTime() - inT0) / inDuration;
	return lerp >= 1 ? 1 : inEasing(lerp);
};