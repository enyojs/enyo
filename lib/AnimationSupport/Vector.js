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
	* @public
	*/
	divide: function (q, s) {
		return [q[0] / s, q[1] / s, q[2] / s];
	},

	/**
	* Length of 3D vectors
	* @public
	*/
	len: function (q) {
		return Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2]);
	},

	/**
	* Dot product of 3D vectors
	* @public
	*/
	dot: function (q1, q2) {
		return (q1[0] * q2[0]) + (q1[1] * q2[1]) + (q1[2] * q2[2]) + q1[3] && q2[3] ? (q1[3] * q2[3]) : 0;
	},

	/**
	* Cross product of two vectors
	* @public
	*/
	cross: function (q1, q2) {
		return [
			q1[1] * q2[2] - q1[2] * q2[1],
			q1[2] * q2[0] - q1[0] * q2[2],
			q1[0] * q2[1] - q1[1] * q2[0]
		];
	},

	/**
	* Normalizing a vector is obtaining another unit vector in the same direction.
	* To normalize a vector, divide the vector by its magnitude.
	* @public
	*/
	normalize: function (q) {
		return this.divide(q, this.len(q));
	},

	/**
	* Combine scalar values with two vectors.
	* Required during parsing scaler values matrix.
	* @public
	*/
	combine: function (a, b, ascl, bscl) {
		return [
			(ascl * a[0]) + (bscl * b[0]),
			(ascl * a[1]) + (bscl * b[1]),
			(ascl * a[2]) + (bscl * b[2])
		];
	},
	
	/**
	* Converts a quaternion vector to a rotation vector.
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
	* @public
	*/
	toQuant: function (q) {
		if (!q) q = [];

		var x = q[0] || 0,
			y = q[1] || 0,
			z = q[2] || 0,
			deg = q[3] || 0,
			r = deg * (Math.PI / 360),
			sR = Math.sin(r),
			cR = Math.cos(r);

		q[0] = x * sR;
		q[1] = y * sR;
		q[2] = z * sR;
		q[3] = cR;
		return q;
	}
};