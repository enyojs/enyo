require('enyo');

var
    frame = require('./Frame'),
    matrixUtil = require('./Matrix'),
    Vector = require('./Vector');

var oldState, newState, node, matrix, cState = [];
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
     * Tweens public API which notifies to change current state of 
     * a character. This method is normally trigger by the Animation Core to
     * update the animating characters state based on the current timestamp.
     *
     * As of now this method is provided as an interface for application 
     * to directly trigger an animation. However, this will be later made private
     * and will be accessible only by the interfaces exposed by framework.
     * @parameter chrac-        Animating character
     *          ts-         DOMHighResTimeStamp
     *
     * @public
     */
    update: function(charc, ts) {
        var t,
            dur = charc._duration,
            since = ts - charc._startTime;

        if (since < 0) return;
        if (since <= dur) {
            t = since / dur;
            this.step(charc, t);
        } else {
            this.step(charc, 1);
        }
    },

    /**
     * Tweens public API which notifies to change current state of 
     * a character based on its interaction delta. This method is normally trigger by the Animation Core to
     * update the animating characters state based on the current delta change.
     *
     * As of now this method is provided as an interface for application 
     * to directly trigger an animation. However, this will be later made private
     * and will be accessible only by the interfaces exposed by framework.
     * @parameter   chrac-      Animating character
     *              dt-         An array of delta dimensions like [x,y,z]
     *
     * @public
     */
    updateDelta: function(charc, dt) {
        var d,
            st,
            dst,
            inc,
            frc = charc.friction || 1,
            trD = charc.animThresholdDuration || 1000,
            trh = charc.animMaxThreshold || false,
            dir = charc.direction || 0,
            tot = charc.getDistance() || frame.getComputedDistance(
                charc.getAnimation(),
                charc._startAnim,
                charc._endAnim);

        dt = dt || charc.animDelta[dir];
        if (dt) {
            dt = frc * dt;
            dst = charc._animCurDistane || 0;
            inc = dst + dt * (charc.reverse ? -1 : 1);
            st = inc > 0 && inc <= tot;

            if (st) {
                d = inc / tot;
                if (trh && inc > trh && dt === 0) {
                    charc.setDuration(trD);
                    charc.start(true);
                }
                this.step(charc, d);
            } else {
                charc.animating = st;
                charc.reverse = inc <= 0;
            }

            charc._animCurDistane = st ? inc : 0;
            charc.animDelta = [];
        }
    },

    /**
     * @private
     */
    step: function(charc, t) {
        var k, c, d, pts, props;

        node = charc.node;
        newState = charc._endAnim;
        d = charc._duration;
        props = charc.getAnimation();
        oldState = charc._startAnim;
        charc.currentState = charc.currentState || {};


        for (k in props) {
            cState = frame.copy(charc.currentState[k] || []);
            if (newState[k]) {
                if (charc.ease && (typeof charc.ease !== 'function')) {
                    if ((k == 'rotate')) {
                        pts = this.beizerSPoints(charc.ease, frame.copy(oldState[k]), frame.copy(newState[k]), props[k]);
                        cState = this.beizerSpline(t, pts, cState);
                    } else {
                        pts = this.calculateEase(charc.ease, frame.copy(oldState[k]), frame.copy(newState[k]));
                        cState = this.getBezier(t, pts, cState);
                    }
                } else {
                    c = k == 'rotate' ? this.slerp : this.lerp;
                    cState = t ? c(oldState[k], newState[k], ((typeof charc.ease === 'function') ? charc.ease : this.ease)(t, d), cState) : newState[k];
                }
            }

            if (!frame.isTransform(k)) {
                frame.setProperty(node, k, cState);
            }
            charc.currentState[k] = cState;
        }

        if (charc._transform) {
            matrix = frame.recomposeMatrix(
                charc.currentState.translate,
                charc.currentState.rotate,
                charc.currentState.scale,
                charc.currentState.skew,
                charc.currentState.perspective
            );
            frame.accelerate(node, matrix);
        }

        charc.animationStep && charc.animationStep(t);
    },


    /**
     * @private
     */
    ease: function(t) {
        return t;
    },

    //Without control points
    beizerSlerpPoints: function(ease, startQuat, endQuat, endPoint) {
        var tm, ag, q, key,
            splinePoints = {},
            eD = frame.parseValue(endPoint),
            aN = startQuat;

        if (ease && Object.keys(ease).length > 0) {
            for (key in ease) {
                tm = parseFloat(key) / 100;
                ag = parseFloat(ease[key]);
                eD.pop(); // remove angle from end point.
                eD[eD.length] = ag;
                q = Vector.toQuant(frame.copy(eD));
                splinePoints[tm] = [aN, q];
                aN = q;
            }
            splinePoints[1] = [aN, endQuat];
        }
        return splinePoints;
    },

    //Without control points
    beizerSlerp: function(t, points, vR) {
        var p, key;
        for (p in points) {
            if (p >= t) key = p;
        }
        vR = this.slerp(points[key][0], points[key][1], t);
        return vR;
    },

    //With control points
    beizerSPoints: function(ease, startQuat, endQuat, endPoint) {
        var splinePoints = {},
            time = [0],
            quats = [startQuat];

        var t, a, q, n, _a, aI, bN,
            eD = frame.parseValue(endPoint);

        if (ease && Object.keys(ease).length > 0) {
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

    //With control points
    beizerSpline: function(t, points, vR) {
        if (!vR) vR = [];
        var Q0, Q1, Q2, R0, R1;

        var p, key, pts;
        for (p in points) {
            if (p >= t) key = p;
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
            bValues = this.getBezierValues(t, order);
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

    complete: function(charc) {
        charc.animating = false;
        charc._prop = undefined;
    },

    lerp: function(vA, vB, t, vR) {
        if (!vR) vR = [];
        var i, l = vA.length;

        for (i = 0; i < l; i++) {
            vR[i] = (1 - t) * vA[i] + t * vB[i];
        }
        return vR;
    },

    slerp: function(qA, qB, t, qR) {
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
     * @public
     * @params t: time, points: knot and control points, vR: resulting point
     */
    getBezier: function(t, points, vR) {

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
    }
};
