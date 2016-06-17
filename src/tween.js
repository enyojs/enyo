require('enyo');

var
    dom = require('./dom'),
    utils = require('./utils'),
    transform = require('./transform');


var fn, state, ease, points, path, oldState, newState, node, matrix, cState = [],
    domCSS = {};
/**
 * Tween is a module responsible for creating intermediate frames for an animation.
 * The responsibilities of this module is to;
 * - Interpolating current state of character.
 * - Update DOM based on current state, using matrix for tranform and styles for others.
 *
 * @module enyo/tween
 */
module.exports = {

    /**
     * Indentifies initial pose of an element.
     * @param  {Object} actor - Element to be animated
     * @param  {Object} pose - Current behavior in the animation (at a given time)
     * @param  {Object} pose - Current behavior in the animation (at a given time)
     * @memberOf module:enyo/tween
     * @public
     */
    init: function(actor, pose, initial) {
        var k;
        actor.initialState = actor.initialState || {};
        if (!(actor && pose && pose.animate)) return;
        node = actor.hasNode();
        utils.mixin(pose, getAnimatedProperty(node, pose.animate, initial));
        actor.currentState = pose.currentState;
        for (k in pose.initialState) {
            actor.initialState[k] = actor.initialState[k] || pose.initialState[k];
        }
        return pose;
    },

    /**
     * Step represents state of the actor at any point of time in the animation.
     * @param  {Object} actor - Element to be animated
     * @param  {Object} pose - Current behavior in the animation (at a given time)
     * @param  {Number} t - Fraction which represents the animation (between 0 to 1)
     * @param  {Number} d - Duration of the current pose
     * @memberOf module:enyo/tween
     * @public
     */
    step: function(actor, pose, t, d) {
        if (!(actor && pose && pose.animate)) return;
        t = t < 0 ? 0 : t;
        t = t > 1 ? 1 : t;

        var k;
        domCSS = {};
        node = actor.hasNode();
        state = utils.clone(pose.currentState || pose._startAnim);
        points = pose.controlPoints = pose.controlPoints || {};
        ease = pose.animate && pose.animate.ease ? pose.animate.ease : this.ease;
        path = pose.animate && pose.animate.path;

        if (pose.props) {
            for (k in pose.props) {
                if (!pose._endAnim[k] || k === 'duration' || k === 'ease' || k === 'path') {
                    continue;
                }

                cState = utils.clone(state[k] || []);
                newState = pose._endAnim[k].slice();
                oldState = pose._startAnim[k].slice();

                if (ease && (typeof ease !== 'function')) {
                    if (k == 'rotate') {
                        points[k] = points[k] ||
                            this.bezierSPoints(ease, oldState, newState, pose.props[k], points[k]);
                        fn = this.bezierSpline;
                    } else {
                        points[k] = points[k] ||
                            this.bezierPoints(ease, oldState, newState, points[k]);
                        fn = this.bezier;
                    }
                    cState = fn.call(this, t, points[k], cState);
                } else {
                    fn = (k === 'rotate') ? this.slerp : this.lerp;
                    cState = fn.call(this, oldState, newState, ease(t, d), cState);
                }

                if (!isTransform(k)) {
                    domCSS = toPropertyValue(k, cState, domCSS);
                }
                state[k] = cState;
            }
        } else {
            utils.mixin(state, oldState);
        }

        //TODO: Support for properties other than translate
        if (path) {
            this.traversePath(t, path, state.translate);
        }

        matrix = transform.Matrix.recompose(
            state.translate,
            state.rotate,
            state.scale,
            state.skew,
            state.perspective
        );
        state.matrix = matrix;
        pose.currentState = state;
        domCSS = toTransformValue(matrix, domCSS);

        actor.addStyles(domCSS);
    },

    /**
     * This causes the stopped animation to be removed from GPU layer.
     * @param  {Object} actor - Element to be animated
     * @param  {Object} pose - Current behavior in the animation (at a given time)
     * @memberOf module:enyo/tween
     * @public
     */
    halt: function(actor, pose) {
        var matrix = pose.currentState && pose.currentState.matrix;
        
        pose = transform.Matrix.decompose2D(matrix);
        domCSS = toTransformValue(pose.matrix2D);
        actor.addStyles(domCSS);
    },

    /**
     * Overridden function for applying the default ease.
     * @param  {Number} t - Fraction which represents the animation (between 0 to 1)
     * @return {Number} t
     * @memberOf module:enyo/tween
     * @public
     * @override
     */
    ease: function(t) {
        return t;
    },

    /**
     * Draws linear interpolation between two values.
     * @param  {Number[]} vA - origin vector
     * @param  {Number[]} vB - Destination vector
     * @param  {Number} t - Fraction which represents the animation (between 0 to 1)
     * @param  {Number[]} vR - Resultant vector
     * @return {Number[]} vR
     * @memberOf module:enyo/tween
     * @public
     */
    lerp: function(vA, vB, t, vR) {
        if (!vA) return;
        if (!vR) vR = [];
        var i, l = vA.length;

        for (i = 0; i < l; i++) {
            vR[i] = (1 - t) * vA[i] + t * vB[i];
        }
        return vR;
    },

    /**
     * Draws sperical linear interpolation between two values.
     * @param  {Number[]} qA Quaternion origin
     * @param  {Number[]} qB - Quaternion destination
     * @param  {Number} t - Fraction which represents the animation (between 0 to 1)
     * @param  {Number[]} qR - Resultant quaternion
     * @return {Number[]} qR
     * @memberOf module:enyo/tween
     * @public
     */
    slerp: function(qA, qB, t, qR) {
        if (!qA) return;
        if (!qR) qR = [];
        var a,
            b,
            theta,
            dot = transform.Quaternion.quantDot(qA, qB),
            l = qA.length;

        dot = Math.min(Math.max(dot, -1.0), 1.0);
        if (dot == 1.0) {
            qR = utils.cloneArray(qA);
            return qR;
        }
        theta = Math.acos(dot);
        for (var i = 0; i < l; i++) {
            a = (Math.sin((1 - t) * theta) / Math.sin(theta)) * qA[i];
            b = (Math.sin(t * theta) / Math.sin(theta)) * qB[i];
            qR[i] = a + b;
        }
        return qR;
    },

    /**
     * Creates bezier curve path for animation.
     * @param  {Number} t - Fraction which represents the animation (between 0 to 1)
     * @param  {Number[]} points - knot and control points
     * @param  {Number[]} vR - Resulting points
     * @return {Number[]} vR
     * @memberOf module:enyo/tween
     * @public
     */
    bezier: function(t, points, vR) {
        if (!points) return;
        if (!vR) vR = [];

        var i, j,
            c = points.length,
            l = points[0].length,
            lastIndex = (c - 1),
            startPoint = points[0],
            endPoint = points[lastIndex],
            values = this.getBezierValues(t, lastIndex);

        for (i = 0; i < l; i++) {
            vR[i] = 0;
            for (j = 0; j < c; j++) {
                if ((j > 0) && (j < (c - 1))) {
                    vR[i] = vR[i] + ((startPoint[i] + (points[j][i] * (endPoint[i] - startPoint[i]))) * values[j]);
                } else {
                    vR[i] = vR[i] + (points[j][i] * values[j]);
                }
            }
        }
        return vR;
    },

    /**
     * Returns the control points for bezier curve.
     * @param  {Object} easeObj- The easing object with values.
     * @param  {Number[]} startPoint - Starting point of the curve
     * @param  {Number[]} endPoint - End point of the curve
     * @param  {Number[]} points - control points
     * @return {Number[]} points
     * @memberOf module:enyo/tween
     * @public
     */
    bezierPoints: function(easeObj, startPoint, endPoint, points) {
        if (!easeObj) return;
        var order = (easeObj && Object.keys(easeObj).length) ? (Object.keys(easeObj).length + 1) : 0;
        var bValues = [],
            m1 = [],
            m2 = [],
            m3 = [],
            m4 = [],
            l = 0;
        points = [startPoint];

        var t, a;
        for (var key in easeObj) {
            t = parseFloat(key) / 100;
            a = parseFloat(easeObj[key]) / 100;
            bValues = this.getBezierValues(t, order);
            bValues.shift();
            m1.push(a - bValues.pop());
            m2.push(bValues);
        }

        m3 = transform.Matrix.inverseN(m2, bValues.length);
        m4 = transform.Matrix.multiplyN(m3, m1);
        l = m4.length;
        for (var i = 0; i < l; i++) {
            var pValues = [];
            for (var j = 0; j < endPoint.length; j++) {
                pValues.push(m4[i]);
            }
            points.push(pValues);
        }

        points.push(endPoint);
        return points;
    },

    /**
     * Traverses the path of the animation
     * @param  {Number} t - Fraction which represents the animation (between 0 to 1)
     * @param  {Number[]} path - Array of  points
     * @param  {Number[]} vR Resulatant Array
     * @return {Number[]} vR
     * @memberOf module:enyo/tween
     * @public
     */
    traversePath: function(t, path, vR) {
        if (!path) return;
        if (!vR) vR = [];

        var i, j,
            c = path.length,
            l = path[0].length,
            lastIndex = (c - 1),
            values = this.getBezierValues(t, lastIndex);

        for (i = 0; i < l; i++) {
            vR[i] = 0;
            for (j = 0; j < c; j++) {
                vR[i] = vR[i] + (path[j][i] * values[j]);
            }
        }
        return vR;
    },

    /**
     * Returns the control points for bezier spline.
     * @param  {Object} ease- The easing object with values.
     * @param  {Number[]} startQuat - Quaternion origin
     * @param  {Number[]} endQuat - Quaternion destination
     * @param  {Number[]} endPoint - Final Destination point
     * @param  {Number[]} splinePoints - spline control points
     * @return {Number[]} splinePoints
     * @memberOf module:enyo/tween
     * @public
     */
    bezierSPoints: function(ease, startQuat, endQuat, endPoint, splinePoints) {
        if (!ease) return;
        var time = [0],
            quats = [startQuat];

        var a, n, _a, aI, bN, eP, key, i, j,
            eD = formatCSSValues(endPoint);

        splinePoints = splinePoints || {};
        if (Object.keys(ease).length > 0) {
            for (key in ease) {
                eP = utils.clone(eD);
                a = parseFloat(ease[key]) / 100;
                for (i in eP) {
                    eP[i] *= a;
                }
                quats.push(transform.Quaternion.toQuant(eP));
                time.push(parseFloat(key) / 100);
            }
            quats.push(endQuat);
            time.push(1);
            n = quats.length - 1;
            aI = this.slerp(startQuat, endQuat, 0);
            splinePoints[0] = [quats[0], aI, aI, quats[1]];
            for (i = 0, j = 1; i < n; i++, j++) {
                if (i === 0) {
                    aI = this.slerp(quats[0], this.slerp(quats[2], quats[1], 2.0), 1.0 / 3);
                } else {
                    _a = this.slerp(this.slerp(quats[i - 1], quats[i], 2.0), quats[i + 1], 0.5);
                    aI = this.slerp(quats[j], _a, 1.0 / 3);
                }
                if (j === n) {
                    bN = this.slerp(quats[j], this.slerp(quats[j - 2], quats[j - 1], 2.0), 1.0 / 3);
                } else {
                    _a = this.slerp(this.slerp(quats[j - 1], quats[j], 2.0), quats[j + 1], 0.5);
                    bN = this.slerp(quats[j], _a, -1.0 / 3);
                }
                splinePoints[time[j]] = [quats[i], aI, bN, quats[i + 1]];
            }
        }
        return splinePoints;
    },

    /**
     * Creates bezier spline path for animation.
     * @param  {Number} t - Fraction which represents the animation (between 0 to 1)
     * @param  {Number[]} points - knot and control points
     * @param  {Number[]} vR - Resulting points
     * @return {Number[]} vR
     * @memberOf module:enyo/tween
     * @public
     */
    bezierSpline: function(t, points, vR) {
        if (!points) return;
        if (!vR) vR = [];
        var Q0, Q1, Q2, R0, R1,
            p, key, pts;
        for (p in points) {
            if (p >= t) {
                key = p;
                break;
            }
        }
        pts = points[key];

        if (pts.length >= 4) {
            Q0 = this.slerp(pts[0], pts[1], t);
            Q1 = this.slerp(pts[1], pts[2], t);
            Q2 = this.slerp(pts[2], pts[3], t);
            R0 = this.slerp(Q0, Q1, t);
            R1 = this.slerp(Q1, Q2, t);
            vR = this.slerp(R0, R1, t);
        } else
            vR = this.slerp(pts[0], pts[1], t);
        return vR;
    },

    /**
     * Function to get the bezier coeffients based on the time and order
     * @param  {number} t - time
     * @param  {number} n - order
     * @return {object}   - bezier coefficients
     * @memberOf module:enyo/tween
     * @public
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
            c = getCoeff(n, k) * Math.pow(x, (n - k)) * Math.pow(y, k);
            values.push(c);
        }

        return values;
    }
};

/**
 * This function returns the coefficents based on the order and the current position
 * @param  {number} n - order
 * @param  {number} k - current position
 * @return {object}   - coefficients
 * @private
 */
function getCoeff (n, k) {
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
        return getCoeff(n, n - k);

    return n * getCoeff(n - 1, k - 1) / k;
}

/**
 * Get DOM node animation properties.
 * @param  {HTMLElement} node    DOM node
 * @param  {Object}      props   Properties to fetch from DOM.
 * @param  {Object}      initial Default properties to be applied.
 * @return {Object}              Object with various animation properties.
 * @private
 */
function getAnimatedProperty(node, props, initial) {
    if (!node) return;

    var eP = {},
        sP = initial ? utils.mixin({}, initial) : {},
        tP = {},
        dP = {},
        iP = {},
        m, k, v, t,
        s = initial ? undefined : dom.getComputedStyle(node);

    for (k in props) {
        v = sP[k];
        if (!isTransform(k)) {
            v = v || getStyleValue(s || dom.getComputedStyle(node), k);
            iP[k] = v;
            sP[k] = formatCSSValues(v, k);
            eP[k] = formatCSSValues(props[k], k, sP[k] ? sP[k].length : sP[k]);
        } else {
            v = formatTransformValues(props[k], k);
            if (k.match(/rotate/)) {
                v = transform.Quaternion.toQuant(v);
                tP.rotate = tP.rotate ? transform.Quaternion.multiplication(tP.rotate, v) : v;
            } else {
                t = k.replace(/[XYZ]$/, '');
                tP[t] = tP[t] ? merge(tP[t], v) : v;
            }
            if (k.match(/[XYZ]$/)) {
                t = k.replace(/[XYZ]$/, '');
                props[t] = tP[t].join();
                delete props[k];
            }
        }
    }

    if (initial) {
        dP.translate = initial.translate;
        dP.rotate = initial.rotate.length < 4 ? transform.Quaternion.toQuant(initial.rotate) : initial.rotate;
        dP.scale = initial.scale;
        dP.skew = initial.skew;
        dP.perspective = initial.perspective;
    } else {
        m = getStyleValue(s || dom.getComputedStyle(node), dom.getCssTransformProp());
        m = formatTransformValues(m, 'matrix');
        transform.Matrix.decompose(m, dP);
        iP.transform = transform.Matrix.toString(m);
    }

    for (k in dP) {
        sP[k] = dP[k];
        eP[k] = tP[k] || dP[k];
    }
    return {
        _startAnim: sP,
        _endAnim: eP,
        _transform: dP,
        currentState: dP,
        initialState: iP,
        matrix: m,
        props: props
    };
}

/**
* @private
*/
function merge (ar1, ar2) {
    ar1.map(function(num, id) {
        return num + ar2[id];
    });
    return ar1;
}


/**
 * Converts comma separated values to array.
 * @private
 * @param  {String} val Value of required animation in any property.
 * @param  {Number} length [description]
 * @param  {[type]} prop [description]
 * @return {Number[]}     Create array from val.
 */
function formatCSSValues(val, prop, length) {
    var res;
    if (typeof val === 'function') {
        return val;
    }
    if (prop === 'duration' || prop === 'delay') {
        val = 0;
    }
    if (SHADOW[prop] || COLOR[prop]) {
        if (val === 'none') {
            val = Array(7).fill(0);
        } else if (val.indexOf('rgb') === 0) {
            val = val.split(')')[0].replace(/^\w*\(/, '').concat(val.split(')')[1].split(' ').join());
        } else {
            val = val.split('rgb(')[1].replace(')',',').concat(val.split('rgb(')[0]).replace(/, $/,'');
        }
    }
    res = stringToMatrix(val);
    return length ? res.concat(Array(length - res.length).fill(0)): res;
}

/**
* @private
*/
function formatTransformValues(val, prop) {
    var res;
    switch (prop) {
    case 'translateX':
    case 'rotateX':
    case 'skewX':
        res = [parseFloat(val, 10), 0, 0];
        break;
    case 'translateY':
    case 'rotateY':
    case 'skewY':
        res = [0, parseFloat(val, 10), 0];
        break;
    case 'translateZ':
    case 'rotateZ':
        res = [0, 0, parseFloat(val, 10)];
        break;
    case 'scaleX':
        res = [parseFloat(val, 10), 1, 1];
        break;
    case 'scaleY':
        res = [1, parseFloat(val, 10), 1];
        break;
    case 'scaleZ':
        res = [1, 1, parseFloat(val, 10)];
        break;
    case 'matrix':
        res = transform.Matrix.identity();
        val = stringToMatrix(val.replace(/^\w*\(/, '').replace(')', ''));
        if (val.length <= 6) {
            res[0] = val[0];
            res[1] = val[1];
            res[4] = val[2];
            res[5] = val[3];
            res[12] = val[4];
            res[13] = val[5];
        }
        if (val.length == 16) {
            res = val;
        }
        break;
    default:
        res = stringToMatrix(val);
    }
    return res;
}

/**
 * Validates if property is a transform property.
 * @public
 * @param  {String} transform Any transform property, for which we want to identify whether or not the property is transform.
 * @return {Number}           Value of the required transform property.
 */
function isTransform(transform) {
    return TRANSFORM[transform];
}

/**
* @private
*/
function stringToMatrix(val) {
    if (!val || val === "auto" || val === 'none') {
        return 0;
    }
    return val.toString().split(",").map(function(v) {
        return parseFloat(v, 10);
    });
}

/**
* @private
*/
function toPropertyValue(prop, val, ret) {
    if (!val) return;
    ret = ret || {};
    if (COLOR[prop]) {
        val = val.map(function(v) {
            return parseInt(v, 10);
        });
        val = 'rgb(' + val + ')';
    } else if (INT_UNIT[prop]) {
        val = parseInt(val[0], 10);
    } else if (BORDER[prop]) {
        val = val[0] + '%';
    } else if (OPACITY[prop]) {
        val = val[0].toFixed(6);
        val = (val <= 0) ? '0.000001' : val;
    } else if (SHADOW[prop]) {
        val = 'rgb(' + val.slice(0, 3).map(function(v) {
            return parseInt(v, 10);
        }) + ') ' + val.slice(3).map(function(v) {
            return v + 'px';
        }).join(' ');
    } else {
        val = val[0] + 'px';
    }

    ret[prop] = val;
    return ret;
}


/**
* @private
*/
function toTransformValue (matrix, ret) {
    var mat = transform.Matrix.toString(matrix),
        key = dom.getStyleTransformProp();

    ret = ret || {};
    ret[key] = mat;
    return ret;
}


/**
 * Gets a style property applied from the DOM element.
 * @private
 * @param  {HTMLElement}  style Computed style of a DOM.
 * @param  {String}       key   Property name for which style has to be fetched.
 * @return {Number|HTMLElement} 
 */
function getStyleValue(style, key) {
    return style.getPropertyValue(key) || style[key];
}

var
    BORDER = {
        'border-radius': 1,
        'border-image-slice': 1,
        'border-top-left-radius': 1,
        'border-top-right-radius': 1,
        'border-bottom-left-radius': 1,
        'border-bottom-right-radius': 1
    },
    COLOR = {
        'color': 1,
        'fill': 1,
        'stop-color': 1,
        'flood-color': 1,
        'border-color': 1,
        'outline-color': 1,
        'lighting-color': 1,
        'border-top-color': 1,
        'background-color': 1,
        'border-left-color': 1,
        'border-right-color': 1,
        'border-bottom-color': 1
    },
    INT_UNIT = {
        'z-index': 1
    },
    SHADOW = {
        'box-shadow': 1,
        'text-shadow': 1
    },
    OPACITY = {
        'opacity': 1,
        'flood-opacity': 1,
        'stop-opacity': 1,
        'fill-opacity': 1,
        'stroke-opacity': 1
    },
    TRANSFORM = {
        translate: 1,
        translateX: 1,
        translateY: 1,
        translateZ: 1,
        rotate: 1,
        rotateX: 1,
        rotateY: 1,
        rotateZ: 1,
        skew: 1,
        skewX: 1,
        skewY: 1,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
        perspective: 1
    };