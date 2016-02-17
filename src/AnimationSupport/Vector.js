require('enyo');

/**
 * Vector module for vector related calculations.
 * Also provides API's for Quaternion vectors for rotation.
 *
 * @module enyo/AnimationSupport/Vector
 */
module.exports = {
    /**
     * Divides vector with a scalar value.
     * @param  {Number[]} v - vector
     * @param  {Number} s - scalar value to divide
     * @return {Number[]} resultant vector
     * @memberOf module:enyo/AnimationSupport/Vector
     * @public
     */
    divide: function (v, s) {
        return [v[0] / s, v[1] / s, v[2] / s];
    },

    /**
     * Add vector/quant with a vector/quant.
     * @param  {Number[]} q1 - vector/quant
     * @param  {Number[]} q2 - vector/quant
     * @return {Number[]} added vector/quant
     * @memberOf module:enyo/AnimationSupport/Vector
     * @public
     */
    add: function (q1, q2) {
        var q3 = [];
        q3[0] = q1[0] + q2[0];
        q3[1] = q1[1] + q2[1];
        q3[2] = q1[2] + q2[2];
        if (q1.length > 3 && q2.length > 3) q3[3] = q1[3] + q2[3];
        return q3;
    },

    /**
     * Sub vector/quant with a vector/quant.
     * @param  {Number[]} q1 - vector/quant
     * @param  {Number[]} q2 - vector/quant
     * @return {Number[]} subracted vector/quant
     * @memberOf module:enyo/AnimationSupport/Vector
     * @public
     */
    subtract: function (q1, q2) {
        var q3 = [];
        q3[0] = q1[0] - q2[0];
        q3[1] = q1[1] - q2[1];
        q3[2] = q1[2] - q2[2];
        if (q1.length > 3 && q2.length > 3) q3[3] = q1[3] - q2[3];
        return q3;
    },

    /**
     * Multiply vector/quant with a vector/quant.
     * @param  {Number[]} v - vector
     * @param  {Number} s - scalar value to divide
     * @return {Number[]} resultant vector
     * @memberOf module:enyo/AnimationSupport/Vector
     * @public
     */
    multiply: function (q, s) {
        q[0] *= s;
        q[1] *= s;
        q[2] *= s;
        if (q.length > 3) q[3] *= s;
        return q;
    },

    /**
     * Limits the vector/quant between a maximum and minimum value.
     * @param  {Number[]} q - vector/quant
     * @param  {Number} max - maximum range value
     * @param  {Number} min - minimum range value
     * @return {Number[]} resultant vector/quant
     * @memberOf module:enyo/AnimationSupport/Vector
     * @public
     */
    range: function (q, max, min) {
        for (var i = 0; i < q.length; i++) {
            q[i] = q[i] < min ? Math.max(q[i], min) : q[i] > max ? Math.min(q[i], max) : q[i];
        }
    },

    /**
     * Evaluates the gap between two vector values.
     * Returns the absolute distance between two vectors.
     * @param  {Number[]} v1 - vector
     * @param  {Number[]} v2 - vector
     * @param  {Number} d - distance between vector
     * @return {Number} distance between vector
     * @memberOf module:enyo/AnimationSupport/Vector
     * @public
     */
    distance: function (v1, v2, d) {
        d = Math.sqrt(
        (v1[0] - v2[0]) * (v1[0] - v2[0]) + (v1[1] - v2[1]) * (v1[1] - v2[1]) + (v1[2] - v2[2]) * (v1[2] - v2[2]));
        return (d < 0.01 && d > -0.01) ? 0 : d;
    },

    /**
     * Evaluates the gap between two quanterions values
     * Returns the absolute distance between two quanterions.
     * @param  {Number[]} v1 - quant
     * @param  {Number[]} v2 - quant
     * @param  {Number} d - distance between quant
     * @return {Number} distance between quant
     * @memberOf module:enyo/AnimationSupport/Vector
     * @public
     */
    quantDistance: function (q1, q2, d) {
        d = Math.sqrt(
        (q1[0] - q2[0]) * (q1[0] - q2[0]) + (q1[1] - q2[1]) * (q1[1] - q2[1]) + (q1[2] - q2[2]) * (q1[2] - q2[2]) + (q1[3] - q2[3]) * (q1[3] - q2[3]));
        return (d < 0.0001 && d > -0.0001) ? 0 : d;
    },

    /**
     * Gives the direction of motion from one vector to other.
     * Returns true if moving towards positive direction.
     * @param  {Number[]} v1 - quant
     * @param  {Number[]} v2 - quant
     * @return {boolean} true if positive, false otherwise.
     * @memberOf module:enyo/AnimationSupport/Vector
     * @public
     */
    direction: function (q1, q2) {
        return (q1[0] - q2[0]) < 0 || (q1[1] - q2[1]) < 0 || (q1[2] - q2[2]) < 0;
    },

    /**
     * Retunns an inverse of a quanterion.
     * @param  {Number[]} q - quant
     * @return {Number[]} resultant quant
     * @memberOf module:enyo/AnimationSupport/Vector
     * @public
     */
    quantInverse: function (q) {
        // var d = (q[0] * q[0]) + (q[1] * q[1]) + (q[2] * q[2]) + (q[3] * q[3]);
        return [-q[0], -q[1], -q[2], q[3]];
    },

    /**
     * Length of a vector
     * @param  {Number[]} v - vetor
     * @return {Number} resultant length
     * @memberOf module:enyo/AnimationSupport/Vector
     * @public
     */
    len: function (v) {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    },

    /**
     * Dot product of 3D vectors
     * @param  {Number[]} v1 - vetor
     * @param  {Number[]} v2 - vetor
     * @return {Number} resultant dot product
     * @memberOf module:enyo/AnimationSupport/Vector
     * @public
     */
    dot: function (v1, v2) {
        return (v1[0] * v2[0]) + (v1[1] * v2[1]) + (v1[2] * v2[2]) + (v1[3] !== undefined && v2[3] !== undefined ? (v1[3] * v2[3]) : 0);
    },

    /**
     * Dot product of 3D quanterion
     * @param  {Number[]} q1 - quanterion
     * @param  {Number[]} q2 - quanterion
     * @return {Number} resultant dot product
     * @memberOf module:enyo/AnimationSupport/Vector
     * @public
     */
    quantDot: function (q1, q2) {
        return (q1[0] * q2[0]) + (q1[1] * q2[1]) + (q1[2] * q2[2]) + (q1[3] * q2[3]);
    },

    /**
     * Quant Cross product of 3D quanterion
     * @param  {Number[]} q1 - quanterion
     * @param  {Number[]} q2 - quanterion
     * @return {Number[]} resultant cross product
     * @memberOf module:enyo/AnimationSupport/Vector
     * @public
     */
    quantCross: function (q1, q2) {
        return [
            q1[3] * q2[0] + q1[0] * q2[3] + q1[1] * q2[2] - q1[2] * q2[1],
            q1[3] * q2[1] - q1[0] * q2[2] + q1[1] * q2[3] + q1[2] * q2[0],
            q1[3] * q2[2] + q1[0] * q2[1] - q1[1] * q2[0] + q1[2] * q2[3],
            q1[3] * q2[3] - q1[0] * q2[0] - q1[1] * q2[1] - q1[2] * q2[2]
        ];
    },

    /**
     * Cross product of two vectors
     * @param  {Number[]} v1 - vetor
     * @param  {Number[]} v2 - vetor
     * @return {Number[]} resultant cross product
     * @memberOf module:enyo/AnimationSupport/Vector
     * @public
     */
    cross: function (v1, v2) {
        return [
            v1[1] * v2[2] - v1[2] * v2[1],
            v1[2] * v2[0] - v1[0] * v2[2],
            v1[0] * v2[1] - v1[1] * v2[0]
        ];
    },

    /**
     * Normalizing a vector is obtaining another unit vector in the same direction.
     * To normalize a vector, divide the vector by its magnitude.
     * @param  {Number[]} q1 - quanterion
     * @return {Number[]} resultant quanterion
     * @memberOf module:enyo/AnimationSupport/Vector
     * @public
     */
    normalize: function (q) {
        return this.divide(q, this.len(q));
    },

    /**
     * Combine scalar values with two vectors.
     * Required during parsing scaler values matrix.
     * @param  {Number[]} a - first vector
     * @param  {Number[]} b - second vector
     * @param  {Number[]} ascl - first vector scalar
     * @param  {Number[]} ascl - second vector scalar
     * @return {Number[]} resultant vector
     * @memberOf module:enyo/AnimationSupport/Vector
     * @public
     */
    combine: function (a, b, ascl, bscl) {
        return [
            (ascl * a[0]) + (bscl * b[0]), (ascl * a[1]) + (bscl * b[1]), (ascl * a[2]) + (bscl * b[2])
        ];
    },

    /**
     * Converts a quaternion vector to a rotation vector.
     * @param  {Number[]} rv - quanterion
     * @return {Number[]} resultant rotation vector
     * @memberOf module:enyo/AnimationSupport/Vector
     * @public
     */
    toVector: function (rv) {
        var r = 2 * Math.acos(rv[3]);
        var sA = Math.sqrt(1.0 - rv[3] * rv[3]);
        if (Math.abs(sA) < 0.0005) sA = 1;
        return [rv[0] / sA, rv[1] / sA, rv[2] / sA, r * 180 / Math.PI];
    },

    /**
     * Converts a rotation vector to a quaternion vector.
     * @param  {Number[]} v - vector
     * @return {Number[]} resultant quaternion
     * @memberOf module:enyo/AnimationSupport/Vector
     * @public
     */
    toQuant: function (v) {
        if (!v) v = [];
        var q = [],
            p = parseFloat(v[1] || 0) * Math.PI / 360,
            y = parseFloat(v[2] || 0) * Math.PI / 360,
            r = parseFloat(v[0] || 0) * Math.PI / 360,
            c1 = Math.cos(p),
            c2 = Math.cos(y),
            c3 = Math.cos(r),
            s1 = Math.sin(p),
            s2 = Math.sin(y),
            s3 = Math.sin(r);

        q[3] = Math.round((c1 * c2 * c3 - s1 * s2 * s3) * 100000) / 100000;
        q[0] = Math.round((s1 * s2 * c3 + c1 * c2 * s3) * 100000) / 100000;
        q[1] = Math.round((s1 * c2 * c3 + c1 * s2 * s3) * 100000) / 100000;
        q[2] = Math.round((c1 * s2 * c3 - s1 * c2 * s3) * 100000) / 100000;
        return q;
    },

    /**
     * Converts a quaternion vector vector to a rotation vector.
     * @param  {Number[]} q - quaternion
     * @return {Number[]} resultant vector
     * @memberOf module:enyo/AnimationSupport/Vector
     * @public
     */
    quantToVector: function (q) {
        var vector = [], h, a, b,
            x2 = q[0] * q[0],
            y2 = q[1] * q[1],
            z2 = q[2] * q[2],
            test = q[0] * q[1] + q[2] * q[3];
        if (test > 0.499) {
            vector[1] = 360 / Math.PI * Math.atan2(q[0], q[3]);
            vector[2] = 90;
            vector[0] = 0;
            return;
        }
        if (test < -0.499) {
            vector[1] = -360 / Math.PI * Math.atan2(q[0], q[3]);
            vector[2] = -90;
            vector[0] = 0;
            return;
        }
        h = Math.atan2(2 * q[1] * q[3] - 2 * q[0] * q[2], 1 - 2 * y2 - 2 * z2);
        a = Math.asin(2 * q[0] * q[1] + 2 * q[2] * q[3]);
        b = Math.atan2(2 * q[0] * q[3] - 2 * q[1] * q[2], 1 - 2 * x2 - 2 * z2);
        vector[1] = Math.round(h * 180 / Math.PI);
        vector[2] = Math.round(a * 180 / Math.PI);
        vector[0] = Math.round(b * 180 / Math.PI);

        return vector;
    }
    //TODO: Acheive the same fucntionality for other 11 choices XYX, XZX, XZY, YXY, YXZ, YZX, YZY, ZXY, ZXZ, ZYX, ZYZ 
};