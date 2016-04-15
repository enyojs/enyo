/**
* Contains set of interpolation functions for animations, similar in function to CSS3 transitions.
* @module enyo/easing
*/

var easing = module.exports = {
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
     * @return {number} - calculated time
     */
    easeInQuad: function(t) {
        return t * t;
    },

    /**
     * EaseOutQuad 
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeOutQuad: function(t) {
        return -1 * t * (t - 2);
    },

    /**
     * EaseInOutQuad 
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeInOutQuad: function(t) {
        if ((t *= 2) < 1) return 0.5 * t * t;
        return -0.5 * ((--t) * (t - 2) - 1);
    },

    /**
     * EaseInCubic 
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeInCubic: function(t) {
        return t * t * t;
    },

    /**
     * EaseOutCubic 
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeOutCubic: function(t) {
        return --t * t * t + 1;
    },

    /**
     * EaseInOutCubic
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeInOutCubic: function(t) {
        if ((t *= 2) < 1) return 0.5 * t * t * t;
        return 0.5 * ((t -= 2) * t * t + 2);
    },

    /**
     * EaseInQuart
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeInQuart: function(t) {
        return t * t * t * t;
    },

    /**
     * EaseOutQuart
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeOutQuart: function(t) {
        return -1 * (--t * t * t * t - 1);
    },

    /**
     * EaseInOutQuart
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeInOutQuart: function(t) {
        if ((t *= 2) < 1) return 0.5 * t * t * t * t;
        return -0.5 * ((t -= 2) * t * t * t - 2);
    },

    /**
     * EaseInQuint
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeInQuint: function(t) {
        return t * t * t * t * t;
    },
    /**
     * EaseOutQuint
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeOutQuint: function(t) {
        return --t * t * t * t * t + 1;
    },

    /**
     * EaseInOutQuint
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeInOutQuint: function(t, d) {
        if ((t *= 2) < 1) return 0.5 * t * t * t * t * t;
        return 0.5 * ((t -= 2) * t * t * t * t + 2);
    },

    /**
     * EaseInSine
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeInSine: function(t) {
        return -1 * Math.cos(t * (Math.PI / 2)) + 1;
    },

    /**
     * EaseOutSine
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeOutSine: function(t) {
        return Math.sin(t * (Math.PI / 2));
    },

    /**
     * EaseInOutSine
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeInOutSine: function(t) {
        return -0.5 * (Math.cos(Math.PI * t) - 1);
    },

    /**
     * EaseInExpo
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeInExpo: function(t) {
        return (t === 0) ? 0 : Math.pow(2, 10 * (t - 1));
    },

    /**
     * EaseOutExpo
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeOutExpo: function(t) {
        return (t === 1) ? 1 : -Math.pow(2, -10 * t) + 1;
    },

    /**
     * EaseInOutExpo
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeInOutExpo: function(t) {
        if (t === 0) return 0;
        if (t === 1) return 1;
        if ((t *= 2) < 1) return 0.5 * Math.pow(2, 10 * (t - 1));
        return 0.5 * (-Math.pow(2, -10 * --t) + 2);
    },

    /**
     * EaseInCirc
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeInCirc: function(t) {
        return -1 * (Math.sqrt(1 - t * t) - 1);
    },

    /**
     * EaseOutCirc
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeOutCirc: function(t) {
        return Math.sqrt(1 - --t * t);
    },

    /**
     * EaseInOutCirc
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeInOutCirc: function(t) {
        if ((t *= 2) < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1);
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
     * EaseInBounce
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeInBounce: function(t) {
        return 1 - easing.easeOutBounce(1 - t);
    },

    /**
     * EaseOutBounce
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeOutBounce: function(t) {
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
     * EaseInOutBounce
     * @public
     * @param  {number} t - current time
     * @return {number}   calculated time
     */
    easeInOutBounce: function(t) {
        if (t < 0.5) return easing.easeInBounce(t * 2) * 0.5;
        return easing.easeOutBounce(t * 2 - 1) * 0.5 + 0.5;
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
     * EaseInBack
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInBack: function(t, d, s) {
        if (!s) s = 1.70158;
        return t * t * ((s + 1) * t - s);
    },

    /**
     * EaseOutBack
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeOutBack: function(t, d, s) {
        if (!s) s = 1.70158;
        return --t * t * ((s + 1) * t + s) + 1;
    },

    /**
     * EaseInOutBack
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInOutBack: function(t, d, s) {
        if (!s) s = 1.70158;
        if ((t *= 2) < 1) return 0.5 * (t * t * (((s *= (1.525)) + 1) * t - s));
        return 0.5 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
    }
};