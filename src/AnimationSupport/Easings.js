/**
 * Beginning time
 * @type {number}
 */
var b = 0,
    /**
     * Change in time
     * @type {number}
     */
    c = 1,
    temp = null,
    tempProp = null,
    tempOldState = [],
    tempNewState = [];
/**
 * This module provdes an interface to achieve various types of Easings in animations
 *
 * @module enyo/AnimationSupport/Easings
 */
var easings = module.exports = {

    /**
     * Use this function to check whether the ease object has changed or not.
     * @public
     * @param  {object} currentEase - ease object which we want to check
     * @return {boolean}             - Boolean value for easechanged.
     * True - Yes. The ease object got changed.
     * False - No. The ease object has not changed.
     */
    easeChanged: function(currentEase) {

        if (temp === null) { // setting the values for the first time
            temp = currentEase;
            return false;
        } else {

            if (JSON.stringify(temp) === JSON.stringify(currentEase)) { // compare the values
                return false;
            } else {
                temp = currentEase;
                return true;
            }

        }
    },

    /**
     * Use this function to check whether the animating property of the object has changed or not
     * @public
     * @param  {string} currentProp - Name of the animating property like - "Translate/Opacity/Scale/Rotate"
     * @return {boolean}            - Boolean value for propChange. Either True or False
     */
    propChange: function(currentProp) {

        if (tempProp === null) { // setting the values for the first time
            tempProp = currentProp;
            return false;
        } else {

            if (tempProp === currentProp) { // compare the values
                return false;
            } else {
                tempProp = currentProp;
                return true;
            }

        }
    },

    /**
     * Use this function to check whether the oldState of the object has changed or not
     * @public
     * @param  {object} currentOldState - currentOldState object
     * @return {boolean}            - Boolean value for oldStateChange. Either True or False
     */
    oldStateChange: function(currentOldState) {

        if (tempOldState === null) { // setting the values for the first time
            tempOldState = currentOldState;
            return false;
        } else {
            var compareValue = easings.compareStates(tempOldState, currentOldState);
            if (compareValue === true) { // compare the values
                return false;
            } else {
                tempOldState = currentOldState;
                return true;
            }

        }

    },

    /**
     * Use this function to check whether the newStateChange of the object has changed or not
     *  @public
     * @param  {object} currentNewState -currentNewState object
     * @return {boolean}            - Boolean value for newStateChange. Either True or False
     */
    newStateChange: function(currentNewState) {

        if (tempNewState === null) { // setting the values for the first time
            tempNewState = currentNewState;
            return false;
        } else {
            var compareValue = easings.compareStates(tempNewState, currentNewState);
            if (compareValue === true) { // compare the values
                return false;
            } else {
                tempNewState = currentNewState;
                return true;
            }

        }

    },

    /**
     * Use this function to compare the states which are arrays
     * @public
     * @param  {Number[]} x - old array of the same 
     * @param  {Number[]} y - current array of the same
     * @return {boolean}   - True/ False after comparing the parameters
     */
    compareStates: function(x, y) {
        var xLen = x.length;
        var yLen = y.length;
        if (xLen != yLen) {
            return false;
        }
        for (var i = 0; i < xLen; i++) {
            if (x[i] instanceof Array && y[i] instanceof Array) {
                // recurse into the nested arrays
                if (x[i].length != y[i].length) {
                    return false;
                }
                var recursiveValue = easings.compareStates(x[i], y[i]);
                if (recursiveValue === false) {
                    return false;
                }
            } else {
                if (x[i] != y[i]) {
                    return false;
                }
            }
        }
        return true;
    },

    /**
     * This function returns the coefficents based on the order and the current position
     * @private
     * @param  {number} n - order
     * @param  {number} k - current position
     * @return {object}   - coefficients
     */
    getCoeff: function(n, k) {
        n = parseInt(n, 10);
        k = parseInt(k, 10);
        // Credits
        // https://math.stackexchange.com/questions/202554/how-do-i-compute-binomial-coefficients-efficiently#answer-927064
        if (isNaN(n) || isNaN(k))
            return void 0;
        if ((n < 0) || (k < 0))
            return void 0;
        if (k > n)
            return void 0;
        if (k === 0)
            return 1;
        if (k === n)
            return 1;
        if (k > n / 2)
            return this.getCoeff(n, n - k);

        return n * this.getCoeff(n - 1, k - 1) / k;
    },

    /**
     * Function to get the bezier coeffients based on the time and order
     * @public
     * @param  {number} t - time
     * @param  {number} n - order
     * @return {object}   - bezier coefficients
     */
    getBezierValues: function(t, n) {
        t = parseFloat(t, 10),
            n = parseInt(n, 10);

        if (isNaN(t) || isNaN(n))
            return void 0;
        if ((t < 0) || (n < 0))
            return void 0;
        if (t > 1)
            return void 0;

        var c,
            values = [],

            x = (1 - t),
            y = t;
        //
        // Binomial theorem to expand (x+y)^n
        //
        for (var k = 0; k <= n; k++) {
            c = this.getCoeff(n, k) * Math.pow(x, (n - k)) * Math.pow(y, k);
            values.push(c);
        }

        return values;
    },

    /**
     * Current time multiplied with duration
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number} - time 
     */
    timeCheck: function(t, d) {
        t = t * d;
        return t;
    },

    /**
     * EaseInQuad
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number} - calculated time
     */
    easeInQuad: function(t, d) {
        t = easings.timeCheck(t, d);
        return c * (t /= d) * t + b;
    },

    /**
     * EaseOutQuad 
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeOutQuad: function(t, d) {
        t = easings.timeCheck(t, d);
        return -c * (t /= d) * (t - 2) + b;
    },

    /**
     * EaseInOutQuad 
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInOutQuad: function(t, d) {
        t = easings.timeCheck(t, d);
        if ((t /= d / 2) < 1) return c / 2 * t * t + b;
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },

    /**
     * EaseInCubic 
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInCubic: function(t, d) {
        t = easings.timeCheck(t, d);
        return c * (t /= d) * t * t + b;
    },

    /**
     * EaseOutCubic 
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeOutCubic: function(t, d) {
        t = easings.timeCheck(t, d);
        return c * ((t = t / d - 1) * t * t + 1) + b;
    },

    /**
     * EaseInOutCubic
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInOutCubic: function(t, d) {
        t = easings.timeCheck(t, d);
        if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    },

    /**
     * EaseInQuart
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInQuart: function(t, d) {
        t = easings.timeCheck(t, d);
        return c * (t /= d) * t * t * t + b;
    },

    /**
     * EaseOutQuart
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeOutQuart: function(t, d) {
        t = easings.timeCheck(t, d);
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },

    /**
     * EaseInOutQuart
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInOutQuart: function(t, d) {
        t = easings.timeCheck(t, d);
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    },

    /**
     * EaseInQuint
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInQuint: function(t, d) {
        t = easings.timeCheck(t, d);
        return c * (t /= d) * t * t * t * t + b;
    },
    /**
     * EaseOutQuint
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeOutQuint: function(t, d) {
        t = easings.timeCheck(t, d);
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },

    /**
     * EaseInOutQuint
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInOutQuint: function(t, d) {
        t = easings.timeCheck(t, d);
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },

    /**
     * EaseInSine
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInSine: function(t, d) {
        t = easings.timeCheck(t, d);
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },

    /**
     * EaseOutSine
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeOutSine: function(t, d) {
        t = easings.timeCheck(t, d);
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },

    /**
     * EaseInOutSine
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInOutSine: function(t, d) {
        t = easings.timeCheck(t, d);
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },

    /**
     * EaseInExpo
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInExpo: function(t, d) {
        t = easings.timeCheck(t, d);
        return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },

    /**
     * EaseOutExpo
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeOutExpo: function(t, d) {
        t = easings.timeCheck(t, d);
        return (t === d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },

    /**
     * EaseInOutExpo
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInOutExpo: function(t, d) {
        t = easings.timeCheck(t, d);
        if (t === 0) return b;
        if (t === d) return b + c;
        if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },

    /**
     * EaseInCirc
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInCirc: function(t, d) {
        t = easings.timeCheck(t, d);
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },

    /**
     * EaseOutCirc
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeOutCirc: function(t, d) {
        t = easings.timeCheck(t, d);
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },

    /**
     * EaseInOutCirc
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInOutCirc: function(t, d) {
        t = easings.timeCheck(t, d);
        if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },

    /**
     * EaseInElastic
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
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
     * EaseOutElastic
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
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
     * EaseInOutElastic
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
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
     * EaseInBack
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInBack: function(t, d, s) {
        t = easings.timeCheck(t, d);
        if (!s) s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },

    /**
     * EaseOutBack
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeOutBack: function(t, d, s) {
        t = easings.timeCheck(t, d);
        if (s === undefined) s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },

    /**
     * EaseInOutBack
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInOutBack: function(t, d, s) {
        t = easings.timeCheck(t, d);
        if (s === undefined) s = 1.70158;
        if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },

    /**
     * EaseInBounce
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInBounce: function(t, d) {
        t = easings.timeCheck(t, d);
        return c - easings.easeOutBounce((d - t) / d, d) + b;
    },

    /**
     * EaseOutBounce
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
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
     * EaseInOutBounce
     * @public
     * @param  {number} t - current time 
     * @param  {number} d - duration
     * @return {number}   calculated time
     */
    easeInOutBounce: function(t, d) {
        t = easings.timeCheck(t, d);
        if (t < d / 2) return easings.easeInBounce((t * 2) / d, d) * 0.5 + b;
        return easings.easeOutBounce((t * 2 - d) / d, d) * 0.5 + c * 0.5 + b;
    }

};
