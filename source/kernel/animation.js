(function() {
	var _requestFrame, _cancelFrame;
	if (_cancelFrame = window.webkitCancelRequestAnimationFrame) {
		/*
			API is non-standard, so what enyo exposes may vary from 
			web documentation for various browsers
			in particular, enyo.requestAnimationFrame takes no arguments,
			and the callback receives no arguments
		*/
		_requestFrame = window.webkitRequestAnimationFrame;
		/*
			Note: (we have requested to change the native implementation to do this)
			first return value of webkitRequestAnimationFrame is 0 and a call 
			to webkitCancelRequestAnimationFrame with no arguments will cancel this.
			To avoid this and to allow for a boolean test of the return value,
			make 1 bogus call so the first used return value of webkitRequestAnimationFrame is > 0.
			(we choose to do this rather than wrapping the native function to avoid the overhead)
		*/
		_cancelFrame(_requestFrame(enyo.nop));
	} else if (_cancelFrame = window.mozCancelRequestAnimationFrame) {
		_requestFrame = window.mozRequestAnimationFrame;
	} else {
		_requestFrame = function(inCallback /*, inNode */) {
			return window.setTimeout(inCallback, Math.round(1000/60));
		};
		// Note: IE8 clearTimeout cannot be called via .apply so don't use enyo.bind.
		_cancelFrame = function(inId) {
			return window.clearTimeout(inId);
		}
	}
	/**
		Request an animation callback.

		On compatible browsers, if _inNode_ is defined, the callback will fire only if _inNode_ is visible.

		Returns a request id to be used with [enyo.cancelRequestAnimationFrame](#enyo.cancelRequestAnimationFrame).
	*/
	enyo.requestAnimationFrame = function(inCallback, inNode) {
		return _requestFrame(inCallback, inNode);
	};
	/**
		Cancel a requested animation callback with the specified id.
	*/
	enyo.cancelRequestAnimationFrame = function(inId) {
		return _cancelFrame(inId);
	};
})();

/**
	An assortment of interpolation functions for animations.

	Similar in function to CSS3 transitions.

	Intended for use with [enyo.easedLerp](#enyo.easedLerp)
*/
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

/**
	Gives an interpolation of an animated transition's distance from 0 to 1.

	Given a start time (_inT0_) and an animation duration (_inDuration_), applies the _inEasing_ function to the percentage of time elapsed / duration, capped at 100%. 
*/
enyo.easedLerp = function(inT0, inDuration, inEasing) {
	var lerp = (enyo.now() - inT0) / inDuration;
	return lerp >= 1 ? 1 : inEasing(lerp);
};
