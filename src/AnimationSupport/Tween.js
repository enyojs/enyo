require('enyo');

var
    frame = require('./Frame'),
    easings = require('./Easings'),
    matrixUtil = require('./Matrix'),
    Vector = require('./Vector'),
    utils = require('../utils');

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
     * @private
     */
    step: function(charc, pose, t, d) {
        var k, c, tState, oState, ease, points;

        node = charc.node;
        newState = pose._endAnim;
        ease = pose.animate && pose.animate.ease ? pose.animate.ease: this.ease;
        oldState = pose._startAnim;
        charc.currentState = charc.currentState || {};
        if(pose.props){      
            for (k in pose.props) {
                cState = frame.copy(charc.currentState[k] || []);
                if (newState[k]) {
                    if (ease && (typeof ease !== 'function')) {
                        var checkEaseChange = easings.easeChanged(ease);
                        var propChange = easings.propChange(k);
                        if (!charc.controlPoints || (propChange === true || checkEaseChange === true)) {
                            // for the first time or either of Ease/Propery changed
                            charc.controlPoints = easings.calculateEase(ease, frame.copy(oldState[k]), frame.copy(newState[k]));
                        } else if (propChange === false && checkEaseChange === false) {
                            // for the cases where property and ease remain same and the states are varying
                            var oldStateCheck = easings.oldStateChange(frame.copy(oldState[k]));
                            var newStateCheck = easings.newStateChange(frame.copy(newState[k]));
                            if (oldStateCheck === true || newStateCheck === true) {
                                charc.controlPoints = easings.calculateEase(ease, frame.copy(oldState[k]), frame.copy(newState[k]));
                            }
                        }
                        cState = this.getBezier(t, charc.controlPoints, cState);
                        if (k == 'rotate') 
                            cState = Vector.toQuant(cState);
                    } else {
                        if (k == 'rotate') {
                            tState = Vector.toQuant(newState[k]);
                            oState = Vector.toQuant(oldState[k]);
                            c = this.slerp;
                        } else {
                            tState = newState[k];
                            oState = oldState[k];
                            c = this.lerp;
                        }
                        cState = c(oState, tState, ease(t, d), cState);
                    }
                }

                if (!frame.isTransform(k)) {
                    frame.setProperty(node, k, cState);
                }
                charc.currentState[k] = cState;
            }
        }
        else{
            utils.mixin(charc.currentState,oldState);
        }
        if(charc.path){
            points = this.getBezier(t, charc.path, charc.currentState.translate, true);
            charc.currentState.translate = points;
        }
        matrix = frame.recomposeMatrix(
            charc.currentState.translate,
            charc.currentState.rotate,
            charc.currentState.scale,
            charc.currentState.skew,
            charc.currentState.perspective
        );
        frame.accelerate(node, matrix);

        charc.animationStep && charc.animationStep(t,matrix);
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
    getBezier: function(t, points, vR, isPath) {

        if (!vR) vR = [];

        var i, j,
            c = points.length,
            l = points[0].length,
            lastIndex = (c - 1),
            startPoint = points[0],
            endPoint = points[lastIndex],
            values = easings.getBezierValues(t, lastIndex);
        for (i = 0; i < l; i++) {
            vR[i] = 0;
            for (j = 0; j < c; j++) {
                if(isPath){
                    vR[i] = vR[i] + (points[j][i] * values[j]);
                }
                else {  
                    if((j > 0) && (j < (c - 1))){
                        vR[i] = vR[i] + ((startPoint[i] + (points[j][i] * (endPoint[i] - startPoint[i]))) * values[j]);
                    } else {
                        vR[i] = vR[i] + (points[j][i] * values[j]);
                    }
                } 
            }
        }
        return vR;
    }


};
