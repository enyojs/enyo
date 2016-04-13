require('enyo');

/**
 * Transform module for transform related calculation
 * 
 * @module enyo/AnimationSupport/Transform
 */
module.exports = {
	/**
	 * To create Identity Matrix3d (4X4 order).
	 * @public
	 * @return {Number[]} Identity Matrix3d
	 */
	identity: function() {
		return [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
	},

	/**
	 * To create Identity Matrix2d (3X3 order).
	 * @public
	 * @return {Number[]} Identity Matrix2d
	 */
	identity2D: function() {
		return [1,0,0,0,1,0,0,0,1];
	},

	/**
	 * To translate in any dimension based on co-ordinates.
	 * @public
	 * @param  {Number}   x Translate value in X axis
	 * @param  {Number}   y Translate value in Y axis
	 * @param  {Number}   z Translate value in Z axis
	 * @return {Number[]}   Matrix3d
	 */
	translate: function (x, y, z) {
		return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x ? x : 0, y ? y : 0, z ? z : 0, 1];
	},

	/**
	 * To translate in x dimension
	 * @public
	 * @param  {Number}   x Translate value in X axis
	 * @return {Number[]}   Matrix3d
	 */
	translateX: function (x) {
		return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x ? x : 0, 0, 0, 1];
	},

	/**
	 * To translate in y dimension
	 * @public
	 * @param  {Number}   y Translate value in Y axis
	 * @return {Number[]}   Matrix3d
	 */
	translateY: function (y) {
		return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, y ? y : 0, 0, 1];
	},

	/**
	 * To translate in z dimension
	 * @public
	 * @param  {Number}   z Translate value in Z axis
	 * @return {Number[]}   Matrix3d
	 */
	translateZ: function (z) {
		return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, z ? z : 0, 1];
	},

	/**
	 * To scale in any dimension
	 * @public
	 * @param  {Number}   x Scale value in X axis
	 * @param  {Number}   y Scale value in Y axis
	 * @param  {Number}   z Scale value in Z axis
	 * @return {Number[]}   Matrix3d
	 */
	scale: function (x, y, z) {
		return [x ? x : 1, 0, 0, 0, 0, y ? y : 1, 0, 0, 0, 0, z ? z : 1, 0, 0, 0, 0, 1];
	},

	/**
	 * To skew in any dimension (skew can only happen in 2d)
	 * @public
	 * @param  {Number}   a Skew value in X axis
	 * @param  {Number}   b Skew value in Y axis
	 * @return {Number[]}   Matrix3d
	 */
	skew: function (a, b) {
		a = a ? Math.tan(a * Math.PI / 180): 0;
		b = b ? Math.tan(b * Math.PI / 180): 0;
		return [1, b, 0, 0, a, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	},

	/**
	 * To rotate in x-axis
	 * @public
	 * @param  {Number}   a Rotate value in X axis
	 * @return {Number[]}   Matrix3d
	 */
	rotateX: function (a) {
		var cosa, sina;
		a = a ? a * Math.PI / 180 : 0;
		cosa = Math.cos(a);
		sina = Math.sin(a);
		return [1, 0, 0, 0, 0, cosa, -sina, 0, 0, sina, cosa, 0, 0, 0, 0, 1];
	},

	/**
	 * To rotate in y-axis
	 * @public
	 * @param  {Number}   b Rotate value in Y axis
	 * @return {Number[]}   Matrix3d
	 */
	rotateY: function (b) {
		var cosb, sinb;
		b = b ? b * Math.PI / 180 : 0;
		cosb = Math.cos(b);
		sinb = Math.sin(b);
		return [cosb, 0, sinb, 0, 0, 1, 0, 0, -sinb, 0, cosb, 0, 0, 0, 0, 1];
	},

	/**
	 * To rotate in z-axis
	 * @public
	 * @param  {Number}   g Rotate value in Z axis
	 * @return {Number[]}   Matrix3d
	 */
	rotateZ: function (g) {
		var cosg, sing;
		g = g ? g * Math.PI / 180 : 0;
		cosg = Math.cos(g);
		sing = Math.sin(g);
		return [cosg, -sing, 0, 0, sing, cosg, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	},

	/**
	 * To rotate in any dimension
	 * @public
	 * @param  {Number}   a Rotate value in X axis
	 * @param  {Number}   b Rotate value in Y axis
	 * @param  {Number}   g Rotate value in Z axis
	 * @return {Number[]}   Matrix3d
	 */
	rotate: function (a, b, g) {
		var ca, sa, cb, sb, cg, sg, m;
		a = a ? a * Math.PI / 180 : 0;
		b = b ? b * Math.PI / 180 : 0;
		g = g ? g * Math.PI / 180 : 0;
		ca = Math.cos(a);
		sa = Math.sin(a);
		cb = Math.cos(b);
		sb = Math.sin(b);
		cg = Math.cos(g);
		sg = Math.sin(g);
		m = [
			cb * cg,
			ca * sg + sa * sb * cg,
			sa * sg - ca * sb * cg,
			0,
			-cb * sg,
			ca * cg - sa * sb * sg,
			sa * cg + ca * sb * sg,
			0,
			sb,
			-sa * cb,
			ca * cb,
			0,
			0, 0, 0, 1
		];
		return m;
	},

	/**
	 * To multiply 2 Martix3d (4x4 order)
	 * @public
	 * @param  {Number[]} m1 1st Matrix3d
	 * @param  {Number[]} m2 2nd Matrix3d
	 * @return {Number[]}    Resultant Matrix3d
	 */
	multiply: function(m1, m2) {
		if (m1.constructor !== Array || m2.constructor !== Array) return;
		if (m1.length !==16 || m2.length !==16) return;
		return [
			m1[0] * m2[0] + m1[4] * m2[1] + m1[8] * m2[2],
			m1[1] * m2[0] + m1[5] * m2[1] + m1[9] * m2[2],
			m1[2] * m2[0] + m1[6] * m2[1] + m1[10] * m2[2],
			0,
			m1[0] * m2[4] + m1[4] * m2[5] + m1[8] * m2[6],
			m1[1] * m2[4] + m1[5] * m2[5] + m1[9] * m2[6],
			m1[2] * m2[4] + m1[6] * m2[5] + m1[10] * m2[6],
			0,
			m1[0] * m2[8] + m1[4] * m2[9] + m1[8] * m2[10],
			m1[1] * m2[8] + m1[5] * m2[9] + m1[9] * m2[10],
			m1[2] * m2[8] + m1[6] * m2[9] + m1[10] * m2[10],
			0,
			m1[0] * m2[12] + m1[4] * m2[13] + m1[8] * m2[14] + m1[12],
			m1[1] * m2[12] + m1[5] * m2[13] + m1[9] * m2[14] + m1[13],
			m1[2] * m2[12] + m1[6] * m2[13] + m1[10] * m2[14] + m1[14],
			1
		];
	},

	/**
	 * To multiply 2 matrices (NxN order)
	 * @public
	 * @param  {Number[]} m1 1st Matrix of order N
	 * @param  {Number[]} m2 2nd Matrix of order N
	 * @return {Number[]}    Resultant Matrix of order N
	 */
	multiplyN: function(m1, m2) {
		if (m1.constructor !== Array || m2.constructor !== Array) return;
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
		if (matrix.constructor !== Array) return;
		var i, j, k, r, t,
			result = [],
			row = [];
		for (i = 0; i < n; i++) {
			for (j = n; j < 2 * n; j++) {
				if (i == (j - n)) matrix[i][j] = 1.0;
				else matrix[i][j] = 0.0;
			}
		}

		for (i = 0; i < n; i++) {
			for (j = 0; j < n; j++) {
				if (i != j) {
					r = matrix[j][i] / matrix[i][i];
					for (k = 0; k < 2 * n; k++) {
						matrix[j][k] -= r * matrix[i][k];
					}
				}
			}
		}

		for (i = 0; i < n; i++) {
			t = matrix[i][i];
			for (j = 0; j < 2 * n; j++) {
				matrix[i][j] = matrix[i][j] / t;
			}
		}
		
		for (i = 0; i < n; i++) {
			row = [];
			for (k = 0, j = n; j < 2 * n; j++, k++) {
				row.push(matrix[i][j]);
			}
			result.push(row);
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
	recomposeMatrix: function (trns, rot, sc, sq, per) {
		if (trns.constructor !== Array) return;
		if (rot.constructor !== Array) return;
		if (sc.constructor !== Array) return;
		if (sq.constructor !== Array) return;
		if (per.constructor !== Array) return;
		var i,
			x = rot[0],
			y = rot[1],
			z = rot[2],
			w = rot[3],
			m = this.identity(),
			sM = this.identity(),
			rM = this.identity();
			

		// apply perspective
		if(per) {
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
	decomposeMatrix: function (matrix, ret) {
		if (matrix.constructor !== Array || matrix[15] === 0) return false;
		var i,
			tV = [],
			rV = [],
			pV = [],
			skV = [],
			scV = [],
			row = [],
			pdum3 = {};

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

		scV[0] = this.len(row[0]);
		row[0] = this.normalize(row[0]);
		skV[0] = this.dot(row[0], row[1]);
		row[1] = this.combine(row[1], row[0], 1.0, -skV[0]);

		scV[1] = this.len(row[1]);
		row[1] = this.normalize(row[1]);
		skV[0] /= scV[1];

		// Compute XZ and YZ shears, orthogonalized 3rd row
		skV[1] = this.dot(row[0], row[2]);
		row[2] = this.combine(row[2], row[0], 1.0, -skV[1]);
		skV[2] = this.dot(row[1], row[2]);
		row[2] = this.combine(row[2], row[1], 1.0, -skV[2]);

		// Next, get Z scale and normalize 3rd row.
		scV[2] = this.len(row[2]);
		row[2] = this.normalize(row[2]);
		skV[1] /= scV[2];
		skV[2] /= scV[2];

		pdum3 = this.cross(row[1], row[2]);
		if (this.dot(row[0], pdum3) < 0) {
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
	decompose2DMatrix: function (m, ret) {
		if (m.constructor !== Array) return;
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
	toString: function (m) {
		var i, ms = m.length > 10 ? 'matrix3d(' : 'matrix(';
		for (i = 0; i < m.length -1; i++) {
			ms += (m[i] < 0.000001 && m[i] > -0.000001) ? '0,' : m[i] + ',';
		}
		ms += m[m.length -1] + ')';
		return ms;
	},

    /**
     * Length of a vector
     * @param  {Number[]} v - vector
     * @return {Number} resultant length
     * @public
     */
    len: function (v) {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    },

	/**
     * Divides vector with a scalar value.
     * @param  {Number[]} v - vector
     * @param  {Number} s - scalar value to divide
     * @return {Number[]} resultant vector
     * @public
     */
    divide: function (v, s) {
        return [v[0] / s, v[1] / s, v[2] / s];
    },

    /**
     * Gives the direction of motion from one vector to other.
     * Returns true if moving towards positive direction.
     * @param  {Number[]} v1 - quant
     * @param  {Number[]} v2 - quant
     * @return {boolean} true if positive, false otherwise.
     * @public
     */
    direction: function (q1, q2) {
        return (q1[0] - q2[0]) < 0 || (q1[1] - q2[1]) < 0 || (q1[2] - q2[2]) < 0;
    },

    /**
     * Dot product of 3D vectors
     * @param  {Number[]} v1 - vector
     * @param  {Number[]} v2 - vector
     * @return {Number} resultant dot product
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
     * @public
     */
    quantDot: function (q1, q2) {
        return (q1[0] * q2[0]) + (q1[1] * q2[1]) + (q1[2] * q2[2]) + (q1[3] * q2[3]);
    },

    /**
     * Cross product of two vectors
     * @param  {Number[]} v1 - vector
     * @param  {Number[]} v2 - vector
     * @return {Number[]} resultant cross product
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
     * @param  {Number[]} bscl - second vector scalar
     * @return {Number[]} resultant vector
     * @public
     */
    combine: function (a, b, ascl, bscl) {
        return [
            (ascl * a[0]) + (bscl * b[0]), (ascl * a[1]) + (bscl * b[1]), (ascl * a[2]) + (bscl * b[2])
        ];
    },

    /**
     * Converts a rotation vector to a quaternion vector.
     * @param  {Number[]} v - vector
     * @return {Number[]} resultant quaternion
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
    }
    //TODO: Acheive the same fucntionality for other 11 choices XYX, XZX, XZY, YXY, YXZ, YZX, YZY, ZXY, ZXZ, ZYX, ZYZ 
};