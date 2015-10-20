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
	divide: function (v, s) {
		return [v[0] / s, v[1] / s, v[2] / s];
	},

	/**
	* Add vector/quant with a vector/quant.
	* @public
	*/
	add: function (q1, q2) {
		q1[0] += q2[0];
		q1[1] += q2[1];
		q1[2] += q2[2];
		if (q1.length > 3 && q2.length > 3) q1[3] += q2[3];
		return q1;
	},

	/**
	* Sub vector/quant with a vector/quant.
	* @public
	*/
	subtract: function (q1, q2) {
		q1[0] -= q2[0];
		q1[1] -= q2[1];
		q1[2] -= q2[2];
		if (q1.length > 3 && q2.length > 3) q1[3] -= q2[3];
		return q1;
	},

	/**
	* Multiply vector/quant with a vector/quant.
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
	* @public
	*/
	range: function (q, max, min) {
		for (var i = 0; i < q.length; i++) {
			q[i] = q[i] < min ? Math.max(q[i], min) : q[i] > max ? Math.min(q[i], max) : q[i];
		}
	},

	/**
	* Compares each vector/qunat with a scalar value to check if its equal.
	* Returns true when all the vector/quant values are equal to this scalar value.
	* @public
	*/
	equalS: function(q1, s) {
		return (q1.length > 0) && q1.every(function(e, i) {
			return e === (s || 0); 
		});
	},

	/**
	* Compares each vector/qunat with a scalar value to check if its greater.
	* Returns true when all the vector/quant values are greater or equal to this scalar value.
	* @public
	*/
	greaterS: function(q1, s) {
		return  (q1.length > 0) && q1.every(function(e, i) {
			return e >= (s || 0); 
		});
	},

	/**
	* Compares each vector/qunat with a scalar value to check if its lesser.
	* Returns true when all the vector/quant values are lesser or equal to this scalar value.
	* @public
	*/
	lesserS: function(q1, s) {
		return (q1.length > 0) && q1.every(function(e, i) {
			return e < (s || 0); 
		});
	},

	/**
	* Evaluates the gap between two vector values.
	* Returns the absolute distance between two vectors.
	* @public
	*/
	distance: function(q1, q2, d) {
		d = Math.sqrt(
			(q1[0] - q2[0]) * (q1[0] - q2[0]) +
			(q1[1] - q2[1]) * (q1[1] - q2[1]) +
			(q1[2] - q2[2]) * (q1[2] - q2[2])
		);
		return (d < 0.01 && d > -0.01) ? 0 : d;
	},

	/**
	* Evaluates the gap between two quanterions values
	* Returns the absolute distance between two quanterions.
	* @public
	*/
	quantDistance: function (q1, q2, d) {
		d = Math.sqrt(
			(q1[0] - q2[0]) * (q1[0] - q2[0]) +
			(q1[1] - q2[1]) * (q1[1] - q2[1]) +
			(q1[2] - q2[2]) * (q1[2] - q2[2]) +
			(q1[3] - q2[3]) * (q1[3] - q2[3])
		);
		return (d < 0.0001 && d > -0.0001) ? 0 : d;
	},

	/**
	* Gives the direction of motion from one vector to other.
	* Returns true if moving towards positive direction.
	* @public
	*/
	direction: function (q1, q2) {
		return (q1[0] - q2[0]) < 0 || (q1[1] - q2[1]) < 0 || (q1[2] - q2[2]) < 0;
	},

	/**
	* Retunns an inverse of a quanterion.
	* @public
	*/
	quantInverse: function (q) {
		// var d = (q[0] * q[0]) + (q[1] * q[1]) + (q[2] * q[2]) + (q[3] * q[3]);
		return [-q[0], -q[1], -q[2], q[3]];
	},

	/**
	* Length of 3D vectors
	* @public
	*/
	sumS: function (q, s) {
		return q[0] * s + q[1] * s + q[2] * s + q[3] !== undefined ? q[3] * s : 0;
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
		return (q1[0] * q2[0]) + (q1[1] * q2[1]) + (q1[2] * q2[2]) + (q1[3] !== undefined && q2[3] !== undefined ? (q1[3] * q2[3]) : 0);
	},

	/**
	* Quant Dot product of 3D vectors
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