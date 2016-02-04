require('enyo');

/**
 * Matrix module for matrix related calculation
 * 
 * @module enyo/AnimationSupport/Matrix
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
	 * To translate in any dimension based on co-ordinates.
	 * @public
	 * @param  {Number}   x Translate value in X axis
	 * @param  {Number}   y Translate value in Y axis
	 * @param  {Number}   z Translate value in Z axis
	 * @return {Number[]}   Matrix3d
	 */
	translate: function (x, y, z) {
		return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y ? y : 0, z ? z : 0, 1];
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
		return [x, 0, 0, 0, 0, y ? y : 1, 0, 0, 0, 0, z ? z : 1, 0, 0, 0, 0, 1];
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
		a = a * Math.PI / 180;
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
		b = b * Math.PI / 180;
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
		g = g * Math.PI / 180;
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
		a = a * Math.PI / 180;
		b = b * Math.PI / 180;
		g = g * Math.PI / 180;
		var ca = Math.cos(a);
		var sa = Math.sin(a);
		var cb = Math.cos(b);
		var sb = Math.sin(b);
		var cg = Math.cos(g);
		var sg = Math.sin(g);
		var m = [
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
			precision = 100000,
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
					r = Math.round(r * precision) / precision;
					for (k = 0; k < 2 * n; k++) {
						t = Math.round(matrix[j][k] * precision) / precision;
						t -= Math.round((r * matrix[i][k]) * precision) / precision;
						matrix[j][k] = t;
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
	 * Convert Matrix3d array to Matrix3d String
	 * @public
	 * @param  {Number[]} m Matrix3d Array
	 * @return {String}     Matrix3d String
	 */
	toString: function (m) {
		var ms = 'matrix3d(';
		for (var i = 0; i < 15; i++) {
			ms += (m[i] < 0.000001 && m[i] > -0.000001) ? '0,' : m[i] + ',';
		}
		ms += m[15] + ')';
		return ms;
	}
};