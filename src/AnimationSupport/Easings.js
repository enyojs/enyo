/**
 * Interface to achieve Easings in various animations
 *
 * @module enyo/AnimationSupport/Easings
 * @public
 */

var b = 0,
    c = 1;

var easings = {

    timeCheck: function(t, d) {
        t = t * d;
        return t;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeInQuad: function(t, d) {
        t = easings.timeCheck(t, d);
        return c * (t /= d) * t + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeOutQuad: function(t, d) {
        t = easings.timeCheck(t, d);
        return -c * (t /= d) * (t - 2) + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeInOutQuad: function(t, d) {
        t = easings.timeCheck(t, d);
        if ((t /= d / 2) < 1) return c / 2 * t * t + b;
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeInCubic: function(t, d) {
        t = easings.timeCheck(t, d);
        return c * (t /= d) * t * t + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeOutCubic: function(t, d) {
        t = easings.timeCheck(t, d);
        return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeInOutCubic: function(t, d) {
        t = easings.timeCheck(t, d);
        if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeInQuart: function(t, d) {
        t = easings.timeCheck(t, d);
        return c * (t /= d) * t * t * t + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeOutQuart: function(t, d) {
        t = easings.timeCheck(t, d);
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeInOutQuart: function(t, d) {
        t = easings.timeCheck(t, d);
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeInQuint: function(t, d) {
        t = easings.timeCheck(t, d);
        return c * (t /= d) * t * t * t * t + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeOutQuint: function(t, d) {
        t = easings.timeCheck(t, d);
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeInOutQuint: function(t, d) {
        t = easings.timeCheck(t, d);
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeInSine: function(t, d) {
        t = easings.timeCheck(t, d);
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeOutSine: function(t, d) {
        t = easings.timeCheck(t, d);
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeInOutSine: function(t, d) {
        t = easings.timeCheck(t, d);
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeInExpo: function(t, d) {
        t = easings.timeCheck(t, d);
        return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeOutExpo: function(t, d) {
        t = easings.timeCheck(t, d);
        return (t === d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeInOutExpo: function(t, d) {
        t = easings.timeCheck(t, d);
        if (t === 0) return b;
        if (t === d) return b + c;
        if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeInCirc: function(t, d) {
        t = easings.timeCheck(t, d);
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeOutCirc: function(t, d) {
        t = easings.timeCheck(t, d);
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeInOutCirc: function(t, d) {
        t = easings.timeCheck(t, d);
        if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeInElastic: function(t, d) {
        var a = c,
            p = 0,
            s = 1.70158;
        t = easings.timeCheck(t, d);
        if (t === 0) return b;
        if ((t /= d) === 1) return b + c;
        if (!p) p = d * 0.3;
        if (a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else s = p / (2 * Math.PI) * Math.asin(c / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeOutElastic: function(t, d) {
        var a = c,
            p = 0,
            s = 1.70158;
        t = easings.timeCheck(t, d);
        if (t === 0) return b;
        if ((t /= d) === 1) return b + c;
        if (!p) p = d * 0.3;
        if (a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else s = p / (2 * Math.PI) * Math.asin(c / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeInOutElastic: function(t, d) {
        var a = c,
            p = 0,
            s = 1.70158;
        t = easings.timeCheck(t, d);
        if (t === 0) return b;
        if ((t /= d / 2) === 2) return b + c;
        if (!p) p = d * (0.3 * 1.5);
        if (a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else s = p / (2 * Math.PI) * Math.asin(c / a);
        if (t < 1) return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeInBack: function(t, d, s) {
        t = easings.timeCheck(t, d);
        if (!s) s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeOutBack: function(t, d, s) {
        t = easings.timeCheck(t, d);
        if (s === undefined) s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeInOutBack: function(t, d, s) {
        t = easings.timeCheck(t, d);
        if (s === undefined) s = 1.70158;
        if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeInBounce: function(t, d) {
        t = easings.timeCheck(t, d);
        return c - easings.easeOutBounce((d - t) / d, d) + b;
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeOutBounce: function(t, d) {
        t = easings.timeCheck(t, d);
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        } else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
        } else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
        } else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
        }
    },
    /**
     * @public
     * apply the below type of ease to the DOM element 
     */
    easeInOutBounce: function(t, d) {
        t = easings.timeCheck(t, d);
        if (t < d / 2) return easings.easeInBounce((t * 2) / d, d) * 0.5 + b;
        return easings.easeOutBounce((t * 2 - d) / d, d) * 0.5 + c * 0.5 + b;
    }

};
module.exports = easings;
