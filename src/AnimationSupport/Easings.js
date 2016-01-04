/**
 * Interface to achieve Easings in various animations
 *
 * @module enyo/AnimationSupport/Easings
 * @public
 */
var matrixUtil = require('./Matrix');

var b = 0,
    c = 1,
    temp = null,
    tempProp = null,
    tempOldState = [],
    tempNewState = [];

var easings = {
    /**
     * @public
     * apply the function to check whether the ease object has changed
     * @params currentEase : the ease object which is currently available
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
     * @public
     * apply the function to check whether the animating property of the object has changed
     * @params currentProp : the animating property of the object which is currently available
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
     * @public
     * apply the function to check whether the oldState of the object has changed
     * @params currentOldState : the oldState  of the object which is currently available
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
     * @public
     * apply the function to check whether the newState of the object has changed
     * @params currentOldState : the newState  of the object which is currently available
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
     * @public
     * apply the function to compare the states which are arrays
     * @params currentOldState : x is the previous state and y is the current state
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

    calculateEase: function(easeObj, startPoint, endPoint) {
        var order = (easeObj && Object.keys(easeObj).length) ? (Object.keys(easeObj).length + 1) : 0;
        var controlPoints = [startPoint],
            bValues = [],
            m1 = [],
            m2 = [],
            m3 = [],
            m4 = [],
            l = 0;

        var t, a;
        for (var key in easeObj) {
            t = parseFloat(key) / 100;
            a = parseFloat(easeObj[key]) / 100;
            bValues = easings.getBezierValues(t, order);
            bValues.shift();
            m1.push(a - bValues.pop());
            m2.push(bValues);
        }

        m3 = matrixUtil.inverseN(m2, bValues.length);

        m4 = matrixUtil.multiplyN(m3, m1);
        l = m4.length;
        for (var i = 0; i < l; i++) {
            controlPoints.push([m4[i], m4[i], m4[i]]);
        }

        controlPoints.push(endPoint);
        return controlPoints;
    },
    /**
     * @private
     * @params n: order, k: current position
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
     * @public
     * @params t: time, n: order
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
