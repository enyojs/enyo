require('enyo');

var
    frame = require('./Frame'),
    Easings = require('./Easings'),
    Vector = require('./Vector'),
    Matrix = require('./Matrix'),
    utils = require('../utils');

var fn, state, ease, points, path, oldState, newState, node, matrix, cState = [];
/**
 * Tween is a module responsible for creating intermediate frames for an animation.
 * The responsibilities of this module is to;
 * - Interpolating current state of character.
 * - Update DOM based on current state, using matrix for tranform and styles for others.
 *
 * @module enyo/AnimationSupport/Tween
 */
module.exports = {

    /**
     * @private
     */
    init: function (actor, pose, initial) {
        if (!(actor && pose && pose.animate)) return;
        node = actor.hasNode();
        utils.mixin(pose, frame.getComputedProperty(node, pose.animate, initial || actor.currentState));
        actor.currentState = pose.currentState;
        return pose;
    },

    /**
	 * Step represents state of the actor at any point of time in the animation.
	 * @param  {Object} actor - Element to be animated
	 * @param  {Object} pose - Current behavior in the animation (at a given time)
	 * @param  {Number} t - Fraction which represents the animation (between 0 to 1)
	 * @param  {Number} d - Duration of the current pose
	 * @memberOf module:enyo/AnimationSupport/Tween
	 * @private
	 */
    step: function(actor, pose, t, d) {
        if (!(actor && pose && pose.animate)) return;
        t = t < 0 ? 0 : t;
        t = t > 1 ? 1 : t;

        var k;
        node = actor.hasNode();
        state = actor.currentState = actor.currentState || pose.currentState || {};
        points = pose.controlPoints = pose.controlPoints || {};
        ease = pose.animate && pose.animate.ease ? pose.animate.ease : this.ease;
        path = pose.animate && pose.animate.path;

        if (pose.props) {
            for (k in pose.props) {
                if (!pose._endAnim[k]) {
                    continue;
                }

                cState = utils.clone(state[k] || []);
                newState = utils.clone(pose._endAnim[k]);
                oldState = utils.clone(pose._startAnim[k]);
                
                if (ease && (typeof ease !== 'function')) {
                    if (k == 'rotate') {
                        newState = Vector.toQuant(newState);
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
                    if (k == 'rotate') {
                        newState = Vector.toQuant(newState);
                        fn = this.slerp;
                    } else {
                        fn = this.lerp;
                    }
                    cState = fn.call(this, oldState, newState, ease(t, d), cState);
                }
                
                if (!frame.isTransform(k)) {
                    
                    frame.setProperty(actor, k, cState);
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

        matrix = frame.recomposeMatrix(
            state.translate,
            state.rotate,
            state.scale,
            state.skew,
            state.perspective
        );
        frame.accelerate(actor, matrix);
        state.matrix = matrix;
        
        actor.currentState = pose.currentState = state;
    },

    halt: function (actor, pose) {
        var matrix = actor.currentState && actor.currentState.matrix;
        pose = frame.decompose2DMatrix(matrix, pose);
        frame.accelerate(actor, pose.matrix2D);
    },

    /**
     * Overridden function for applying the default ease.
     * @param  {Number} t - Fraction which represents the animation (between 0 to 1)
     * @return {Number} t
     * @memberOf module:enyo/AnimationSupport/Tween
     * @private
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
     * @memberOf module:enyo/AnimationSupport/Tween
     * @private
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
     * @memberOf module:enyo/AnimationSupport/Tween
     * @private
     */
    slerp: function(qA, qB, t, qR) {
        if (!qA) return;
        if (!qR) qR = [];
        var a,
            b,
            theta,
            dot = Vector.quantDot(qA, qB),
            l = qA.length;

        dot = Math.min(Math.max(dot, -1.0), 1.0);
        if (dot == 1.0) {
            qR = frame.copy(qA);
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
     * @memberOf module:enyo/AnimationSupport/Tween
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
            values = Easings.getBezierValues(t, lastIndex);

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
     * @memberOf module:enyo/AnimationSupport/Tween
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
            bValues = Easings.getBezierValues(t, order);
            bValues.shift();
            m1.push(a - bValues.pop());
            m2.push(bValues);
        }

        m3 = Matrix.inverseN(m2, bValues.length);
        m4 = Matrix.multiplyN(m3, m1);
        l = m4.length;
        for (var i = 0; i < l; i++) {
            points.push([m4[i], m4[i], m4[i]]);
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
     * @memberOf module:enyo/AnimationSupport/Tween
     */
    traversePath: function (t, path, vR) {
        if (!path) return;
        if (!vR) vR = [];

        var i, j,
            c = path.length,
            l = path[0].length,
            lastIndex = (c - 1),
            values = Easings.getBezierValues(t, lastIndex);

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
     * @memberOf module:enyo/AnimationSupport/Tween
     */
    bezierSPoints: function(ease, startQuat, endQuat, endPoint, splinePoints) {
        if (!ease) return;
        var time = [0],
            quats = [startQuat];

        var t, a, q, n, _a, aI, bN,
            eD = frame.parseValue(endPoint);

        splinePoints = splinePoints || {};
        quats.push(startQuat);
        time.push(0);
        if (Object.keys(ease).length > 0) {
            for (var key in ease) {
                t = parseFloat(key) / 100;
                a = parseFloat(ease[key]);
                eD.pop(); // remove angle from end point.
                eD[eD.length] = a;
                q = Vector.toQuant(frame.copy(eD));
                quats.push(q);
                time.push(t);
            }
            quats.push(endQuat);
            time.push(1);
            n = quats.length - 1;
            ai = this.slerp(startQuat, endQuat, 0);
            splinePoints[0] = [quats[0], aI, aI, quats[1]];
            for (var i = 0, j = 1; i < n; i++, j++) {
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
     * @memberOf module:enyo/AnimationSupport/Tween
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
    }
};