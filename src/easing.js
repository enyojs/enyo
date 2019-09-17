/**
* Contains set of interpolation functions for animations, similar in function to CSS3 transitions.
* @module enyo/easing
*/

var easing = module.exports = {
	/**
	* Linear ease with no acceleration
	* @public
	*/
	linear: function(n) {
		return n;
	},
	/**
	* Accelerating with second-degree polynomial.
	* @public
	*/
	quadIn: function(t) {
		return t * t;
	},
	/**
	* Deaccelerating with second-degree polynomial.
	* @public
	*/
	quadOut: function(t) {
		return -1 * t * (t - 2);
	},
	/**
	* Halfway accelerating and then deaccelerating with second-degree polynomial.
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
	* Accelerating with third-degree polynomial.
	* @public
	*/
	cubicIn: function(n) {
		return Math.pow(n, 3);
	},
	/**
	* Deaccelerating with third-degree polynomial.
	* @public
	*/
	cubicOut: function(n) {
		return Math.pow(n - 1, 3) + 1;
	},
	/**
	* Halfway accelerating and then deaccelerating with third-degree polynomial.
	* @public
	*/
	cubicInOut: function(t) {
		if ((t *= 2) < 1) return 0.5 * t * t * t;
		return 0.5 * ((t -= 2) * t * t + 2);
	},
	/**
	* Accelerating with fourth-degree polynomial
	* @public
	*/
	quartIn: function(t) {
		return t * t * t * t;
	},
	/**
	* Deaccelerating with fourth-degree polynomial
	* @public
	*/
	quartOut: function(t) {
		return -1 * (--t * t * t * t - 1);
	},
	/**
	* Halfway accelerating and then deaccelerating with fourth-degree polynomial
	* @public
	*/
	quartInOut: function(t) {
		if ((t *= 2) < 1) return 0.5 * t * t * t * t;
		return -0.5 * ((t -= 2) * t * t * t - 2);
	},
	/**
	* Accelerating with fifth-degree polynomial
	* @public
	*/
	quintIn: function(t) {
		return t * t * t * t * t;
	},
	/**
	* Deaccelerating with fifth-degree polynomial
	* @public
	*/
	quintOut: function(t) {
		return --t * t * t * t * t + 1;
	},
	/**
	* Halfway accelerating and then deaccelerating with fifth-degree polynomial
	* @public
	*/
	quintInOut: function(t, d) {
		if ((t *= 2) < 1) return 0.5 * t * t * t * t * t;
		return 0.5 * ((t -= 2) * t * t * t * t + 2);
	},
	/**
	* Accelerating using a sine formula
	* @public
	*/
	sineIn: function(t) {
		return -1 * Math.cos(t * (Math.PI / 2)) + 1;
	},
	/**
	* Deaccelerating using a sine formula
	* @public
	*/
	sineOut: function(t) {
		return Math.sin(t * (Math.PI / 2));
	},
	/**
	* Halfway accelerating and then deaccelerating using a sine formula
	* @public
	*/
	sineInOut: function(t) {
		return -0.5 * (Math.cos(Math.PI * t) - 1);
	},
	/**
	* Accelerating using an exponential formula
	* @public
	*/
	expoIn: function(t) {
		return (t === 0) ? 0 : Math.pow(2, 10 * (t - 1));
	},
	/**
	* Deaccelerating using an exponential formula
	* @public
	*/
	expoOut: function(n) {
		return (n == 1) ? 1 : (-1 * Math.pow(2, -10 * n) + 1);
	},
	/**
	* Halfway accelerating and then deaccelerating using an exponential formula
	* @public
	*/
	expoInOut: function(t) {
		if (t === 0) return 0;
		if (t === 1) return 1;
		if ((t *= 2) < 1) return 0.5 * Math.pow(2, 10 * (t - 1));
		return 0.5 * (-Math.pow(2, -10 * --t) + 2);
	},
	/**
	* Accelerating using a circular function
	* @public
	*/
	circIn: function(t) {
		return -1 * (Math.sqrt(1 - t * t) - 1);
	},
	/**
	* Deaccelerating using a circular function
	* @public
	*/
	circOut: function(t) {
		return Math.sqrt(1 - (--t * t));
	},
	/**
	* Halfway accelerating and then deaccelerating using a circular function
	* @public
	*/
	circInOut: function(t) {
		if ((t *= 2) < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1);
		return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
	},
	/**
	* Accelerating with a bouncing effect
	* @public
	*/
	bounceIn: function(t) {
		return 1 - easing.bounceOut(1 - t);
	},
	/**
	* Deaccelerating with a bouncing effect
	* @public
	*/
	bounceOut: function(t) {
		if (t < 0.363636) {
			return 7.5625 * t * t;
		} else if (t < 0.727272) {
			return 7.5625 * (t -= 0.545454) * t + 0.75;
		} else if (t < (2.5 / 2.75)) {
			return 7.5625 * (t -= 0.818182) * t + 0.9375;
		} else {
			return 7.5625 * (t -= 0.954545) * t + 0.984375;
		}
	},
	/**
	* Halfway accelerating and then deaccelerating with a bouncing effect
	* @public
	*/
	bounceInOut: function(t) {
		if (t < 0.5) return easing.bounceIn(t * 2) * 0.5;
		return easing.bounceOut(t * 2 - 1) * 0.5 + 0.5;
	},
	/**
	* Accelerating as a spring oscillating back and forth until it comes to rest
	* @public
	*/
	elasticIn: function(t, d) {
		var a = 1,
			p = 0,
			s = 1.70158;
		if (t === 0) return 0;
		if (t === 1) return 1;
		if (!p) p = d * 0.3;
		if (a < 1) {
			a = 1;
			s = p / 4;
		} else s = p / (2 * Math.PI) * Math.asin(1 / a);
		return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p));
	},
	/**
	* Deaccelerating as a spring oscillating back and forth until it comes to rest
	* @public
	*/
	elasticOut: function(t, d) {
		var a = 1,
			p = 0,
			s = 1.70158;
		if (t === 0) return 0;
		if (t === 1) return 1;
		if (!p) p = d * 0.3;
		if (a < 1) {
			a = 1;
			s = p / 4;
		} else s = p / (2 * Math.PI) * Math.asin(1 / a);
		return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + 1;
	},
	/**
	* Halfway accelerating and then deaccelerating as a spring 
	* oscillating back and forth until it comes to rest
	* @public
	*/
	elasticInOut: function(t, d) {
		var a = 1,
			p = 0,
			s = 1.70158;
		if (t === 0) return 0;
		if ((t *= 2) === 2) return 1;
		if (!p) p = d * (0.3 * 1.5);
		if (a < 1) {
			a = 1;
			s = p / 4;
		} else s = p / (2 * Math.PI) * Math.asin(1 / a);
		if (t < 1) return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p));
		return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + 1;
	},
	/**
	* Accelerating while retracting slightly before it begins to animate in the path indicated
	* @public
	*/
	backIn: function(t, d, s) {
		if (!s) s = 1.70158;
		return t * t * ((s + 1) * t - s);
	},
	/**
	* Deaccelerating while retracting slightly before it begins to animate in the path indicated
	* @public
	*/
	backOut: function(t, d, s) {
		if (!s) s = 1.70158;
		return --t * t * ((s + 1) * t + s) + 1;
	},
	/**
	* Halfway accelerating and then deaccelerating while retracting 
	* slightly before it begins to animate in the path indicated
	* @public
	*/
	backInOut: function(t, d, s) {
		if (!s) s = 1.70158;
		if ((t *= 2) < 1) return 0.5 * (t * t * (((s *= (1.525)) + 1) * t - s));
		return 0.5 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
	}
};