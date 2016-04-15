require('enyo');

/**
 * To create a Typed_array
 * @param  {Number} size The size of the buffer required
 * @return {Number[]}   Typed_array
 */
function typedArray (size) {
    return new Float32Array(new ArrayBuffer(size));
}

/**
 * To input the specified indices with value 1
 * @param  {Number[]} matrix    typedArray sent
 * @param  {Number[]} numberMat indices where value has to be 1
 */
function inputValues (matrix, numberMat) {
    for (var i = 0; i < numberMat.length; i++) {
        matrix[numberMat[i]] = 1;
    }
}

/**
 * Transform module for transform related calculation
 * 
 * @module enyo/AnimationSupport/Transform
 */


/**
 * To create Identity Matrix3d as array.
 * @public
 * @return {Number[]} Identity Matrix3d
 */
var identity = exports.identity = function() {
    var identityMatrix, modifiedMat;
    identityMatrix = typedArray(64);
    modifiedMat = inputValues(identityMatrix, new Uint8Array([0, 5, 10, 15]));
    return identityMatrix;
};

/**
 * To create Identity Matrix2d as array.
 * @public
 * @return {Number[]} Identity Matrix2d as array
 */
exports.identity2D = function() {
    var identity2D, modifiedMat;
    identity2D = typedArray(36);
    modifiedMat = inputValues(identity2D, new Uint8Array([0, 4, 8]));
    return identity2D;
};

/**
 * To translate in any dimension based on co-ordinates.
 * @public
 * @param  {Number}   x Translate value in X axis
 * @param  {Number}   y Translate value in Y axis
 * @param  {Number}   z Translate value in Z axis
 * @return {Number[]}   Matrix3d
 */
exports.translate = function(x, y, z) {
    var translateMat, modifiedMat;
    translateMat = typedArray(64);
    modifiedMat = inputValues(translateMat, new Uint8Array([0, 5, 10, 15]));
    translateMat[12] = x;
    translateMat[13] = y ? y : 0;
    translateMat[14] = z ? z : 0;
    return translateMat;
};

/**
 * To translate in x dimension
 * @public
 * @param  {Number}   x Translate value in X axis
 * @return {Number[]}   Matrix3d
 */
exports.translateX = function(x) {
    var translateX, modifiedMat;
    translateX = typedArray(64);
    modifiedMat = inputValues(translateX, new Uint8Array([0, 5, 10, 15]));
    translateX[12] = x ? x : 0;
    return translateX;
};

/**
 * To translate in y dimension
 * @public
 * @param  {Number}   y Translate value in Y axis
 * @return {Number[]}   Matrix3d
 */
exports.translateY = function(y) {
    var translateY, modifiedMat;
    translateY = typedArray(64);
    modifiedMat = inputValues(translateY, new Uint8Array([0, 5, 10, 15]));
    translateY[13] = y ? y : 0;
    return translateY;
};

/**
 * To translate in z dimension
 * @public
 * @param  {Number}   z Translate value in Z axis
 * @return {Number[]}   Matrix3d
 */
exports.translateZ = function(z) {
    var translateZ, modifiedMat;
    translateZ = typedArray(64);
    modifiedMat = inputValues(translateZ, new Uint8Array([0, 5, 10, 15]));
    translateZ[14] = z ? z : 0;
    return translateZ;
};

/**
 * To scale in any dimension
 * @public
 * @param  {Number}   x Scale value in X axis
 * @param  {Number}   y Scale value in Y axis
 * @param  {Number}   z Scale value in Z axis
 * @return {Number[]}   Matrix3d
 */
exports.scale = function(x, y, z) {
    var scaleMat = typedArray(64);
    scaleMat[0] = x;
    scaleMat[5] = y ? y : 1;
    scaleMat[10] = z ? z : 1;
    scaleMat[15] = 1;
    return scaleMat;
};

/**
 * To skew in any dimension (skew can only happen in 2d)
 * @public
 * @param  {Number}   a Skew value in X axis
 * @param  {Number}   b Skew value in Y axis
 * @return {Number[]}   Matrix3d
 */
exports.skew =function(a, b) {
    var skewMat, modifiedMat;
    a = a ? Math.tan(a * Math.PI / 180) : 0;
    b = b ? Math.tan(b * Math.PI / 180) : 0;

    skewMat = typedArray(64);
    modifiedMat = inputValues(skewMat, new Uint8Array([0, 5, 10, 15]));
    skewMat[1] = b;
    skewMat[4] = a;
    return skewMat;
};

/**
 * To rotate in x-axis
 * @public
 * @param  {Number}   a Rotate value in X axis
 * @return {Number[]}   Matrix3d
 */
exports.rotateX = function(a) {
    var cosa, sina, rotateXMat, modifiedMat;
    a = a ? a * Math.PI / 180 : 0;
    cosa = Math.cos(a);
    sina = Math.sin(a);

    rotateXMat = typedArray(64);
    modifiedMat = inputValues(rotateXMat, new Uint8Array([0, 15]));
    rotateXMat[5] = cosa;
    rotateXMat[6] = -sina;
    rotateXMat[9] = sina;
    rotateXMat[10] = cosa;
    return rotateXMat;
};

/**
 * To rotate in y-axis
 * @public
 * @param  {Number}   b Rotate value in Y axis
 * @return {Number[]}   Matrix3d
 */
exports.rotateY = function(b) {
    var cosb, sinb, rotateYMat, modifiedMat;
    b = b ? b * Math.PI / 180 : 0;
    cosb = Math.cos(b);
    sinb = Math.sin(b);

    rotateYMat = typedArray(64);
    modifiedMat = inputValues(rotateYMat, new Uint8Array([5, 15]));
    rotateYMat[0] = cosb;
    rotateYMat[2] = sinb;
    rotateYMat[8] = -sinb;
    rotateYMat[10] = cosb;
    return rotateYMat;
};

/**
 * To rotate in z-axis
 * @public
 * @param  {Number}   g Rotate value in Z axis
 * @return {Number[]}   Matrix3d
 */
exports.rotateZ = function(g) {
    var cosg, sing, rotateZMat;
    g = g ? g * Math.PI / 180 : 0;
    cosg = Math.cos(g);
    sing = Math.sin(g);

    rotateZMat = typedArray(64);
    rotateZMat[0] = cosg;
    rotateZMat[1] = -sing;
    rotateZMat[4] = sing;
    rotateZMat[5] = cosg;
    rotateZMat[15] = 1;
    return rotateZMat;
};

/**
 * To rotate in any dimension
 * @public
 * @param  {Number}   a Rotate value in X axis
 * @param  {Number}   b Rotate value in Y axis
 * @param  {Number}   g Rotate value in Z axis
 * @return {Number[]}   Matrix3d
 */
exports.rotate = function(a, b, g) {
    var ca, sa, cb, sb, cg, sg, rotateMat;
    a = a ? a * Math.PI / 180 : 0;
    b = b ? b * Math.PI / 180 : 0;
    g = g ? g * Math.PI / 180 : 0;
    ca = Math.cos(a);
    sa = Math.sin(a);
    cb = Math.cos(b);
    sb = Math.sin(b);
    cg = Math.cos(g);
    sg = Math.sin(g);

    rotateMat = typedArray(64);
    rotateMat[0] = cb * cg;
    rotateMat[1] = ca * sg + sa * sb * cg;
    rotateMat[2] = sa * sg - ca * sb * cg;
    rotateMat[4] = -cb * sg;
    rotateMat[5] = ca * cg - sa * sb * sg;
    rotateMat[6] = sa * cg + ca * sb * sg;
    rotateMat[8] = sb;
    rotateMat[9] = -sa * cb;
    rotateMat[10] = ca * cb;
    rotateMat[15] = 1;
    return rotateMat;
};



var matrix = exports.Matrix = {

    /**
     * To create Identity Matrix (NXN order).
     * @public
     * @param  {Number}   N Order of Identity Matrix
     * @return {Number[][]} Identity Matrix of order N
     */
    identityMatrix: function(N) {
        var i, j, row, result = [];
        for (i = 0; i < N; i++) {
            row = [];
            for (j = 0; j < N; j++) {
                if (i === j) {
                    row.push(1);
                } else {
                    row.push(0);
                }
            }
            result.push(row);
        }
        return result;
    },
    /**
     * To multiply 2 Martix3d (4x4 order)
     * @public
     * @param  {Number[]} m1 1st Matrix3d
     * @param  {Number[]} m2 2nd Matrix3d
     * @return {Number[]}    Resultant Matrix3d
     */
    multiply: function(m1, m2) {
        if (m1.length !== 16 || m2.length !== 16) return;
        var multiplyMat = typedArray(64);
        multiplyMat[0] = m1[0] * m2[0] + m1[4] * m2[1] + m1[8] * m2[2];
        multiplyMat[1] = m1[1] * m2[0] + m1[5] * m2[1] + m1[9] * m2[2];
        multiplyMat[2] = m1[2] * m2[0] + m1[6] * m2[1] + m1[10] * m2[2];
        multiplyMat[4] = m1[0] * m2[4] + m1[4] * m2[5] + m1[8] * m2[6];
        multiplyMat[5] = m1[1] * m2[4] + m1[5] * m2[5] + m1[9] * m2[6];
        multiplyMat[6] = m1[2] * m2[4] + m1[6] * m2[5] + m1[10] * m2[6];
        multiplyMat[8] = m1[0] * m2[8] + m1[4] * m2[9] + m1[8] * m2[10];
        multiplyMat[9] = m1[1] * m2[8] + m1[5] * m2[9] + m1[9] * m2[10];
        multiplyMat[10] = m1[2] * m2[8] + m1[6] * m2[9] + m1[10] * m2[10];
        multiplyMat[12] = m1[0] * m2[12] + m1[4] * m2[13] + m1[8] * m2[14] + m1[12];
        multiplyMat[13] = m1[1] * m2[12] + m1[5] * m2[13] + m1[9] * m2[14] + m1[13];
        multiplyMat[14] = m1[2] * m2[12] + m1[6] * m2[13] + m1[10] * m2[14] + m1[14];
        multiplyMat[15] = 1;
        return multiplyMat;
    },

    /**
     * To multiply 2 Martix3d (n*n order)
     * @param  {Number[]} m1 1st Matrix3d
     * @param  {Number[]} m2 2nd Matrix3d
     * @return {[type]}    Resultant Matrix3d
     */
    multiplyN: function(m1, m2) {
        var i, j, sum,
            m = [],
            l1 = m1.length,
            l2 = m2.length;

        for (i = 0; i < l1; i++) {
            sum = 0;
            for (j = 0; j < l2; j++) {
                sum += m1[i][j] * m2[j];
            }
            m.push(sum);
        }
        return m;
    },

    /**
     * To inverse matrix of order N
     * @public
     * @param  {Number[]} matrix Matrix (NxN order)
     * @param  {Number}   n      Order of the matrix
     * @return {Number[]}        Inverted Matrix
     */
    inverseN: function(matrix, n) {
        var i, j, k, r, t,
            result = this.identityMatrix(n);

        for (i = 0; i < n; i++) {
            for (j = 0; j < n; j++) {
                if (i != j) {
                    r = matrix[j][i] / matrix[i][i];
                    for (k = 0; k < n; k++) {
                        matrix[j][k] -= r * matrix[i][k];
                        result[j][k] -= r * result[i][k];
                    }
                }
            }
        }

        for (i = 0; i < n; i++) {
            t = matrix[i][i];
            for (j = 0; j < n; j++) {
                matrix[i][j] = matrix[i][j] / t;
                result[i][j] = result[i][j] / t;
            }
        }

        return result;
    },

    /**
     * Calculate matrix3d of a frame based on transformation vectors.
     * @public
     * @param  {Number[]} trns Translate vector
     * @param  {Number[]} rot  Rotate quaternion vector
     * @param  {Number[]} sc   Scale vector
     * @param  {Number[]} sq   Skew vector
     * @param  {Number[]} per  Perspective vector
     * @return {Number[]}      Final Matrix3d for particular frame
     */
    recompose: function(trns, rot, sc, sq, per) {
        var i,
            x = rot[0],
            y = rot[1],
            z = rot[2],
            w = rot[3],
            m = identity.call(),
            sM = identity.call(),
            rM = identity.call();


        // apply perspective
        if (per) {
            m[3] = per[0];
            m[7] = per[1];
            m[11] = per[2];
            m[15] = per[3];
        }

        m[12] = trns[0];
        m[13] = trns[1];
        m[14] = trns[2];

        // apply rotate
        rM[0] = 1 - 2 * (y * y + z * z);
        rM[1] = 2 * (x * y - z * w);
        rM[2] = 2 * (x * z + y * w);
        rM[4] = 2 * (x * y + z * w);
        rM[5] = 1 - 2 * (x * x + z * z);
        rM[6] = 2 * (y * z - x * w);
        rM[8] = 2 * (x * z - y * w);
        rM[9] = 2 * (y * z + x * w);
        rM[10] = 1 - 2 * (x * x + y * y);

        m = this.multiply(m, rM);

        // apply skew
        if (sq[2]) {
            sM[9] = sq[2];
            m = this.multiply(m, sM);
        }

        if (sq[1]) {
            sM[9] = 0;
            sM[8] = sq[1];
            m = this.multiply(m, sM);
        }

        if (sq[0]) {
            sM[8] = 0;
            sM[4] = sq[0];
            m = this.multiply(m, sM);
        }

        // apply scale
        for (i = 0; i < 12; i += 4) {
            m[0 + i] *= sc[0];
            m[1 + i] *= sc[1];
            m[2 + i] *= sc[2];
        }
        return m;
    },

    /**
     * Decompose transformation vectors into various properties out of matrix3d.
     * @public
     * @param  {Number[]} matrix Matrix3d
     * @param  {Object}   ret    To store various transformation properties like translate, rotate, scale, skew and perspective.
     * @return {Boolean}         true, if matrix exists else false.
     */
    decompose: function(matrix, ret) {
        if (matrix[15] === 0) return false;
        var i,
            tV = [],
            rV = [],
            pV = [],
            skV = [],
            scV = [],
            row = [],
            pdum3 = [];

        for (i = 0; i < 16; i++)
            matrix[0] /= matrix[15];

        //TODO: decompose perspective
        pV = [0, 0, 0, 0];

        for (i = 0; i < 3; i++)
            tV[i] = matrix[12 + i];

        for (i = 0; i < 12; i += 4) {
            row.push([
                matrix[0 + i],
                matrix[1 + i],
                matrix[2 + i]
            ]);
        }

        scV[0] = vector.len(row[0]);
        row[0] = quaternion.normalize(row[0]);
        skV[0] = vector.dot(row[0], row[1]);
        row[1] = vector.combine(row[1], row[0], 1.0, -skV[0]);

        scV[1] = vector.len(row[1]);
        row[1] = quaternion.normalize(row[1]);
        skV[0] /= scV[1];

        // Compute XZ and YZ shears, orthogonalized 3rd row
        skV[1] = vector.dot(row[0], row[2]);
        row[2] = vector.combine(row[2], row[0], 1.0, -skV[1]);
        skV[2] = vector.dot(row[1], row[2]);
        row[2] = vector.combine(row[2], row[1], 1.0, -skV[2]);

        // Next, get Z scale and normalize 3rd row.
        scV[2] = vector.len(row[2]);
        row[2] = quaternion.normalize(row[2]);
        skV[1] /= scV[2];
        skV[2] /= scV[2];

        pdum3 = vector.cross(row[1], row[2]);
        if (vector.dot(row[0], pdum3) < 0) {
            for (i = 0; i < 3; i++) {
                scV[i] *= -1;
                row[i][0] *= -1;
                row[i][1] *= -1;
                row[i][2] *= -1;
            }
        }

        rV[0] = 0.5 * Math.sqrt(Math.max(1 + row[0][0] - row[1][1] - row[2][2], 0));
        rV[1] = 0.5 * Math.sqrt(Math.max(1 - row[0][0] + row[1][1] - row[2][2], 0));
        rV[2] = 0.5 * Math.sqrt(Math.max(1 - row[0][0] - row[1][1] + row[2][2], 0));
        rV[3] = 0.5 * Math.sqrt(Math.max(1 + row[0][0] + row[1][1] + row[2][2], 0));

        if (row[2][1] > row[1][2]) rV[0] = -rV[0];
        if (row[0][2] > row[2][0]) rV[1] = -rV[1];
        if (row[1][0] > row[0][1]) rV[2] = -rV[2];

        ret.translate = tV;
        ret.rotate = rV;
        ret.scale = scV;
        ret.skew = skV;
        ret.perspective = pV;
        return true;
    },

    /**
     * Decompose transformation matrix2d from matrix3d.
     * @public
     * @param  {Number[]} matrix Matrix3d
     * @param  {Object}   ret    To store various transformation properties like translate, angle and matrix.
     * @return {Boolean}  ret    To store various transformation properties like translate, angle and matrix.
     */
    decompose2D: function(m, ret) {
        var scale = [],
            matrix = [],
            row0x = m[0],
            row0y = m[1],
            row1x = m[4],
            row1y = m[5],
            det, angle, sn, cs,
            m11, m12, m21, m22;

        ret = ret || {};
        scale = [
            Math.sqrt(row0x * row0x + row0y * row0y),
            Math.sqrt(row1x * row1x + row1y * row1y)
        ];

        // If determinant is negative, one axis was flipped.
        det = row0x * row1y - row0y * row1x;
        if (det < 0)
        // Flip axis with minimum unit vector dot product.
            if (row0x < row1y)
                scale[0] = -scale[0];
            else
                scale[1] = -scale[1];

            // Renormalize matrix to remove scale. 
        if (scale[0]) {
            row0x *= 1 / scale[0];
            row0y *= 1 / scale[0];
        }

        if (scale[1]) {
            row1x *= 1 / scale[1];
            row1y *= 1 / scale[1];
        }
        ret.scale = scale;


        // Compute rotation and renormalize matrix. 
        angle = Math.atan2(row0y, row0x);

        if (angle) {
            sn = -row0y;
            cs = row0x;
            m11 = row0x;
            m12 = row0y;
            m21 = row1x;
            m22 = row1y;
            row0x = cs * m11 + sn * m21;
            row0y = cs * m12 + sn * m22;
            row1x = -sn * m11 + cs * m21;
            row1y = -sn * m12 + cs * m22;
        }

        // Rotate(-angle) = [cos(angle), sin(angle), -sin(angle), cos(angle)]
        //                = [row0x, -row0y, row0y, row0x]
        // Thanks to the normalization above.
        matrix[0] = row0x;
        matrix[1] = row0y;
        matrix[2] = row1x;
        matrix[3] = row1y;
        matrix[4] = m[12];
        matrix[5] = m[13];
        ret.matrix2D = matrix;

        // Convert into degrees because our rotation functions expect it.
        ret.angle = angle * 180 / Math.PI;

        return ret;
    },

    /**
     * Convert Matrix3d array to Matrix3d String
     * @public
     * @param  {Number[]} m Matrix3d Array
     * @return {String}     Matrix3d String
     */
    toString: function(m) {
        var i, ms = m.length > 10 ? 'matrix3d(' : 'matrix(';
        for (i = 0; i < m.length - 1; i++) {
            ms += (m[i] < 0.000001 && m[i] > -0.000001) ? '0,' : m[i] + ',';
        }
        ms += m[m.length - 1] + ')';
        return ms;
    }
};

var vector = exports.Vector = {
    /**
     * Length of a vector
     * @param  {Number[]} v - vector
     * @return {Number} resultant length
     * @public
     */
    len: function(v) {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    },

    /**
     * Divides vector with a scalar value.
     * @param  {Number[]} v - vector
     * @param  {Number} s - scalar value to divide
     * @return {Number[]} resultant vector
     * @public
     */
    divide: function(v, s) {
        var divideVector = new Float32Array([v[0] / s, v[1] / s, v[2] / s]);
        return divideVector;
    },

    /**
     * Dot product of 3D vectors
     * @param  {Number[]} v1 - vector
     * @param  {Number[]} v2 - vector
     * @return {Number} resultant dot product
     * @public
     */
    dot: function(v1, v2) {
        return (v1[0] * v2[0]) + (v1[1] * v2[1]) + (v1[2] * v2[2]) + (v1[3] !== undefined && v2[3] !== undefined ? (v1[3] * v2[3]) : 0);
    },

    /**
     * Cross product of two vectors
     * @param  {Number[]} v1 - vector
     * @param  {Number[]} v2 - vector
     * @return {Number[]} resultant cross product
     * @public
     */
    cross: function(v1, v2) {
        var crossProdMat = new Float32Array([v1[1] * v2[2] - v1[2] * v2[1], v1[2] * v2[0] - v1[0] * v2[2], v1[0] * v2[1] - v1[1] * v2[0]]);
        return crossProdMat;
    },

    /**
     * Combine scalar values with two vectors.
     * Required during parsing scaler values matrix.
     * @param  {Number[]} a - first vector
     * @param  {Number[]} b - second vector
     * @param  {Number[]} ascl - first vector scalar
     * @param  {Number[]} bscl - second vector scalar
     * @return {Number[]} resultant vector
     * @public
     */
    combine: function(a, b, ascl, bscl) {
        var combineMat = new Float32Array([(ascl * a[0]) + (bscl * b[0]), (ascl * a[1]) + (bscl * b[1]), (ascl * a[2]) + (bscl * b[2])]);
        return combineMat;

    }
};

var quaternion = exports.Quaternion = {
    /**
     * Gives the direction of motion from one vector to other.
     * Returns true if moving towards positive direction.
     * @param  {Number[]} q1 - quant
     * @param  {Number[]} q2 - quant
     * @return {boolean} true if positive, false otherwise.
     * @public
     */
    direction: function(q1, q2) {
        return (q1[0] - q2[0]) < 0 || (q1[1] - q2[1]) < 0 || (q1[2] - q2[2]) < 0;
    },

    /**
     * Dot product of 3D quanterion
     * @param  {Number[]} q1 - quanterion
     * @param  {Number[]} q2 - quanterion
     * @return {Number} resultant dot product
     * @public
     */
    quantDot: function(q1, q2) {
        return (q1[0] * q2[0]) + (q1[1] * q2[1]) + (q1[2] * q2[2]) + (q1[3] * q2[3]);
    },

    /**
     * Normalizing a vector is obtaining another unit vector in the same direction.
     * To normalize a vector, divide the vector by its magnitude.
     * @param  {Number[]} q1 - quanterion
     * @return {Number[]} resultant quanterion
     * @public
     */
    normalize: function(q) {
        return vector.divide(q, vector.len(q));
    },

    /**
     * Converts a rotation vector to a quaternion vector.
     * @param  {Number[]} v - vector
     * @return {Number[]} resultant quaternion
     * @public
     */
    toQuant: function(v) {
        if (!v) v = [];
        var p = parseFloat(v[1] || 0) * Math.PI / 360,
            y = parseFloat(v[2] || 0) * Math.PI / 360,
            r = parseFloat(v[0] || 0) * Math.PI / 360,
            c1 = Math.cos(p),
            c2 = Math.cos(y),
            c3 = Math.cos(r),
            s1 = Math.sin(p),
            s2 = Math.sin(y),
            s3 = Math.sin(r),
            q;

        q = new Float32Array([
            Math.round((s1 * s2 * c3 + c1 * c2 * s3) * 100000) / 100000,
            Math.round((s1 * c2 * c3 + c1 * s2 * s3) * 100000) / 100000,
            Math.round((c1 * s2 * c3 - s1 * c2 * s3) * 100000) / 100000,
            Math.round((c1 * c2 * c3 - s1 * s2 * s3) * 100000) / 100000
        ]);

        return q;
    }
    //TODO: Acheive the same fucntionality for other 11 choices XYX, XZX, XZY, YXY, YXZ, YZX, YZY, ZXY, ZXZ, ZYX, ZYZ 
};