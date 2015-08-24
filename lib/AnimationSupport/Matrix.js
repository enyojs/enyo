require('enyo');

/**
* Matrix module for matrix related calculation
*
* @module enyo/AnimationSupport/Matrix
*/
module.exports = {
	/**
	* @public
	*/
	identity: function() {
		return [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
	},

	/**
	* @public
	*/
	translate: function (x, y, z) {
		return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y ? y : 0, z ? z : 0, 1];
	},

	/**
	* @public
	*/
	translateX: function (x) {
		return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x ? x : 0, 0, 0, 1];
	},

	/**
	* @public
	*/
	translateY: function (y) {
		return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, y ? y : 0, 0, 1];
	},

	/**
	* @public
	*/
	translateZ: function (z) {
		return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, z ? z : 0, 1];
	},

	/**
	* @public
	*/
	scale: function (x, y, z) {
		return [x, 0, 0, 0, 0, y ? y : 1, 0, 0, 0, 0, z ? z : 1, 0, 0, 0, 0, 1];
	},

	/**
	* @public
	*/
	skew: function (a, b) {
		a = a ? Math.tan(a * Math.PI / 180): 0;
		b = b ? Math.tan(b * Math.PI / 180): 0;
		return [1, b, 0, 0, a, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	},

	/**
	* @public
	*/
	rotateX: function (a) {
		var cosa, sina;
		a = a * Math.PI / 180;
		cosa = Math.cos(a);
		sina = Math.sin(a);
		return [1, 0, 0, 0, 0, cosa, -sina, 0, 0, sina, cosa, 0, 0, 0, 0, 1];
	},

	/**
	* @public
	*/
	rotateY: function (b) {
		var cosb, sinb;
		b = b * Math.PI / 180;
		cosb = Math.cos(b);
		sinb = Math.sin(b);
		return [cosb, 0, sinb, 0, 0, 1, 0, 0, -sinb, 0, cosb, 0, 0, 0, 0, 1];
	},

	/**
	* @public
	*/
	rotateZ: function (g) {
		var cosg, sing;
		g = g * Math.PI / 180;
		cosg = Math.cos(g);
		sing = Math.sin(g);
		return [cosg, -sing, 0, 0, sing, cosg, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	},

	/**
	* @public
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
	* @public
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
	* @public
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