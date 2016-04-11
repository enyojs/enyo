/**
* Contains methods useful for animations.
* @module enyo/animation
*/

require('enyo');

var
	platform = require('./platform'),
	utils = require('./utils');

var ms = Math.round(1000/60);
var prefix = ['webkit', 'moz', 'ms', 'o', ''];
var r = 'requestAnimationFrame';
var c = 'cancel' + utils.cap(r);

/*
* Fallback on setTimeout
*
* @private
*/
var _requestFrame = function(inCallback) {
	return global.setTimeout(inCallback, ms);
};

/*
* Fallback on clearTimeout
*
* @private
*/
var _cancelFrame = function(inId) {
	return global.clearTimeout(inId);
};

for (var i = 0, pl = prefix.length, p, wc, wr; (p = prefix[i]) || i < pl; i++) {
	// if we're on ios 6 just use setTimeout, requestAnimationFrame has some kinks currently
	if (platform.ios >= 6) {
		break;
	}

	// if prefixed, becomes Request and Cancel
	wc = p ? (p + utils.cap(c)) : c;
	wr = p ? (p + utils.cap(r)) : r;
	// Test for cancelRequestAnimationFrame, because some browsers (Firefix 4-10) have a request without a cancel
	if (global[wc]) {
		_cancelFrame = global[wc];
		_requestFrame = global[wr];
		if (p == 'webkit') {
			/*
				Note: In Chrome, the first return value of webkitRequestAnimationFrame is 0.
				We make 1 bogus call so the first used return value of webkitRequestAnimationFrame is > 0, as the spec requires.
				This makes it so that the requestId is always truthy.
				(we choose to do this rather than wrapping the native function to avoid the overhead)
			*/
			_cancelFrame(_requestFrame(utils.nop));
		}
		break;
	}
}
/**
* Requests an animation callback.
*
* On compatible browsers, if `node` is defined, the [callback]{@glossary callback} will
* fire only if `node` is visible.
*
* @param {Function} callback - A [callback]{@glossary callback} to be executed on the
*                            animation frame.
* @param {Node} node - The DOM node to request the animation frame for.
* @returns {Object} A request id to be used with
*                     {@link module:enyo/animation#cancelRequestAnimationFrame}.
* @public
*/
exports.requestAnimationFrame = function(callback, node) {
	return _requestFrame(callback, node);
};
/**
* Cancels a requested animation callback with the specified id.
*
* @public
*/
exports.cancelRequestAnimationFrame = function(inId) {
	return _cancelFrame(inId);
};

/**
* A set of interpolation functions for animations, similar in function to CSS3
* transitions.
*
* These are intended for use with {@link module:enyo/animation#easedLerp}. Each easing function
* accepts one (1) [Number]{@glossary Number} parameter and returns one (1)
* [Number]{@glossary Number} value.
*
* @public
*/
var easing = exports.easing = /** @lends module:enyo/animation~easing.prototype */ {
	/**
	* linear
	*
	* @public
	*/
	linear: function(n) {
		return n;
	},
	/**
	* cubicIn
	*
	* @public
	*/
	cubicIn: function(n) {
		return Math.pow(n, 3);
	},
	/**
	* cubicOut
	*
	* @public
	*/
	cubicOut: function(n) {
		return Math.pow(n - 1, 3) + 1;
	},
	/**
	* expoOut
	*
	* @public
	*/
	expoOut: function(n) {
		return (n == 1) ? 1 : (-1 * Math.pow(2, -10 * n) + 1);
	},
	/**
	* quadInOut
	*
	* @public
	*/
	quadInOut: function(n) {
		n = n * 2;
		if (n < 1) {
			return Math.pow(n, 2) / 2;
		}
		return -1 * ((--n) * (n - 2) - 1) / 2;
	},

	/**
     * EaseInQuad
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number} - calculated time
     */
    easeInQuad: function(t, d) {
        t = t * d;
        return (t /= d) * t;
    },

    /**
     * EaseOutQuad 
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeOutQuad: function(t, d) {
        t = t * d;
        return -1 * (t /= d) * (t - 2);
    },

    /**
     * EaseInOutQuad 
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInOutQuad: function(t, d) {
        t = t * d;
        if ((t /= d / 2) < 1) return 0.5 * t * t;
        return -0.5 * ((--t) * (t - 2) - 1);
    },

    /**
     * EaseInCubic 
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInCubic: function(t, d) {
        t = t * d;
        return (t /= d) * t * t;
    },

    /**
     * EaseOutCubic 
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeOutCubic: function(t, d) {
        t = t * d;
        return (t = t / d - 1) * t * t + 1;
    },

    /**
     * EaseInOutCubic
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInOutCubic: function(t, d) {
        t = t * d;
        if ((t /= d / 2) < 1) return 0.5 * t * t * t;
        return 0.5 * ((t -= 2) * t * t + 2);
    },

    /**
     * EaseInQuart
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInQuart: function(t, d) {
        t = t * d;
        return (t /= d) * t * t * t;
    },

    /**
     * EaseOutQuart
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeOutQuart: function(t, d) {
        t = t * d;
        return -1 * ((t = t / d - 1) * t * t * t - 1);
    },

    /**
     * EaseInOutQuart
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInOutQuart: function(t, d) {
        t = t * d;
        if ((t /= d / 2) < 1) return 0.5 * t * t * t * t;
        return -0.5 * ((t -= 2) * t * t * t - 2);
    },

    /**
     * EaseInQuint
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInQuint: function(t, d) {
        t = t * d;
        return (t /= d) * t * t * t * t;
    },
    /**
     * EaseOutQuint
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeOutQuint: function(t, d) {
        t = t * d;
        return (t = t / d - 1) * t * t * t * t + 1;
    },

    /**
     * EaseInOutQuint
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInOutQuint: function(t, d) {
        t = t * d;
        if ((t /= d / 2) < 1) return 0.5 * t * t * t * t * t;
        return 0.5 * ((t -= 2) * t * t * t * t + 2);
    },

    /**
     * EaseInSine
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInSine: function(t, d) {
        t = t * d;
        return -1 * Math.cos(t / d * (Math.PI / 2)) + 1;
    },

    /**
     * EaseOutSine
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeOutSine: function(t, d) {
        t = t * d;
        return Math.sin(t / d * (Math.PI / 2));
    },

    /**
     * EaseInOutSine
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInOutSine: function(t, d) {
        t = t * d;
        return -0.5 * (Math.cos(Math.PI * t / d) - 1);
    },

    /**
     * EaseInExpo
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInExpo: function(t, d) {
        t = t * d;
        return (t === 0) ? 0 : Math.pow(2, 10 * (t / d - 1));
    },

    /**
     * EaseOutExpo
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeOutExpo: function(t, d) {
        t = t * d;
        return (t === d) ? 1 : -Math.pow(2, -10 * t / d) + 1;
    },

    /**
     * EaseInOutExpo
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInOutExpo: function(t, d) {
        t = t * d;
        if (t === 0) return 0;
        if (t === d) return 1;
        if ((t /= d / 2) < 1) return 0.5 * Math.pow(2, 10 * (t - 1));
        return 0.5 * (-Math.pow(2, -10 * --t) + 2);
    },

    /**
     * EaseInCirc
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInCirc: function(t, d) {
        t = t * d;
        return -1 * (Math.sqrt(1 - (t /= d) * t) - 1);
    },

    /**
     * EaseOutCirc
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeOutCirc: function(t, d) {
        t = t * d;
        return Math.sqrt(1 - (t = t / d - 1) * t);
    },

    /**
     * EaseInOutCirc
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInOutCirc: function(t, d) {
        t = t * d;
        if ((t /= d / 2) < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1);
        return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
    },

    /**
     * EaseInElastic
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInElastic: function(t, d) {
        var a = 1,
            p = 0,
            s = 1.70158;
        t = t * d;
        if (t === 0) return 0;
        if ((t /= d) === 1) return 1;
        if (!p) p = d * 0.3;
        if (a < Math.abs(1)) {
            a = 1;
            s = p / 4;
        } else s = p / (2 * Math.PI) * Math.asin(1 / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p));
    },

    /**
     * EaseOutElastic
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeOutElastic: function(t, d) {
        var a = 1,
            p = 0,
            s = 1.70158;
        t = t * d;
        if (t === 0) return 0;
        if ((t /= d) === 1) return 1;
        if (!p) p = d * 0.3;
        if (a < Math.abs(1)) {
            a = 1;
            s = p / 4;
        } else s = p / (2 * Math.PI) * Math.asin(1 / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + 1;
    },

    /**
     * EaseInOutElastic
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInOutElastic: function(t, d) {
        var a = 1,
            p = 0,
            s = 1.70158;
        t = t * d;
        if (t === 0) return 0;
        if ((t /= d / 2) === 2) return 1;
        if (!p) p = d * (0.3 * 1.5);
        if (a < Math.abs(1)) {
            a = 1;
            s = p / 4;
        } else s = p / (2 * Math.PI) * Math.asin(1 / a);
        if (t < 1) return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p));
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + 1;
    },

    /**
     * EaseInBack
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInBack: function(t, d, s) {
        t = t * d;
        if (!s) s = 1.70158;
        return (t /= d) * t * ((s + 1) * t - s);
    },

    /**
     * EaseOutBack
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeOutBack: function(t, d, s) {
        t = t * d;
        if (s === undefined) s = 1.70158;
        return (t = t / d - 1) * t * ((s + 1) * t + s) + 1;
    },

    /**
     * EaseInOutBack
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInOutBack: function(t, d, s) {
        t = t * d;
        if (s === undefined) s = 1.70158;
        if ((t /= d / 2) < 1) return 0.5 * (t * t * (((s *= (1.525)) + 1) * t - s));
        return 0.5 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
    },

    /**
     * EaseInBounce
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInBounce: function(t, d) {
        t = t * d;
        return 1 - easing.easeOutBounce((d - t) / d, d);
    },

    /**
     * EaseOutBounce
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeOutBounce: function(t, d) {
        t = t * d;
        if ((t /= d) < (1 / 2.75)) {
            return 7.5625 * t * t;
        } else if (t < (2 / 2.75)) {
            return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
        } else if (t < (2.5 / 2.75)) {
            return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
        } else {
            return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
        }
    },

    /**
     * EaseInOutBounce
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInOutBounce: function(t, d) {
        t = t * d;
        if (t < d / 2) return easing.easeInBounce((t * 2) / d, d) * 0.5;
        return easing.easeOutBounce((t * 2 - d) / d, d) * 0.5 + 0.5;
    }
};

/**
* Gives an interpolation of an animated transition's distance from 0 to 1.
*
* Given a start time (`t0`) and an animation duration (`duration`), this
* method applies the `easing` function to the percentage of time elapsed
* divided by duration, capped at 100%.
*
* @param {Number} t0 - Start time.
* @param {Number} duration - Duration in milliseconds.
* @param {Function} easing - An easing [function]{@glossary Function} reference from
*	{@link module:enyo/animation#easing}.
* @param {Boolean} reverse - Whether the animation will run in reverse.
* @returns {Number} The resulting position, capped at a maximum of 100%.
* @public
*/
exports.easedLerp = function(t0, duration, easing, reverse) {
	var lerp = (utils.perfNow() - t0) / duration;
	if (reverse) {
		return lerp >= 1 ? 0 : (1 - easing(1 - lerp));
	} else {
		return lerp >= 1 ? 1 : easing(lerp);
	}
};

/**
* Gives an interpolation of an animated transition's distance from
* `startValue` to `valueChange`.
*
* Applies the `easing` function with a wider range of variables to allow for
* more complex animations.
*
* @param {Number} t0 - Start time.
* @param {Number} duration - Duration in milliseconds.
* @param {Function} easing - An easing [function]{@glossary Function} reference from
*	{@link module:enyo/animation#easing}.
* @param {Boolean} reverse - Whether the animation will run in reverse.
* @param {Number} time
* @param {Number} startValue - Starting value.
* @param {Number} valueChange
* @returns {Number} The resulting position, capped at a maximum of 100%.
* @public
*/
exports.easedComplexLerp = function(t0, duration, easing, reverse, time, startValue, valueChange) {
	var lerp = (utils.perfNow() - t0) / duration;
	if (reverse) {
		return easing(1 - lerp, time, startValue, valueChange, duration);
	} else {
		return easing(lerp, time, startValue, valueChange, duration);
	}
};
