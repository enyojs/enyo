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
	* @parameter chrac-		Animating character
	*			ts-			DOMHighResTimeStamp
	*
	* @public
	*/
	update: function (charc, ts) {
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
	* @private
	*/
	step: function(charc, t) {
		var k, c, d, pts;

		node = charc.node;
		newState = charc._endAnim;
		d = charc._duration;
		props = charc.getAnimation(),
		oldState = charc._startAnim;
		charc.currentState = charc.currentState || {};

		for (k in props) {
			cState = frame.copy(charc.currentState[k] || []);
			if (charc.ease && (typeof charc.ease !== 'function') && (k !== 'rotate')) {
				pts = this.calculateEase(charc.ease, frame.copy(oldState[k]), frame.copy(newState[k]));
				cState = this.getBezier(t, pts, cState);
			} else {
				c = k == 'rotate' ? this.slerp : this.lerp;
				cState = t ? c(oldState[k], newState[k], ((typeof charc.ease === 'function') ? charc.ease : this.ease)(t, d), cState) : newState[k];
			}
			
			if (!frame.isTransform(k)) {
				frame.setProperty(node, k, cState);
			}
			charc.currentState[k] = cState;
		}

		if(charc._transform) {
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
	ease: function (t) {
		return t;
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

	complete: function (charc) {
		charc.animating = false;
		charc._startAnim = undefined;
		charc._endAnim = undefined;
	},

	lerp: function (vA, vB, t, vR) {
		if (!vR) vR = [];
		var i, l = vA.length;

		for (i = 0; i < l; i++) {
			vR[i] = (1 - t) * vA[i] + t * vB[i];
		}
		return vR;
	},

	slerp: function (qA, qB, t, qR) {
		if (!qR) qR = [];
		var a, b, w, theta, dot = Vector.dot(qA, qB);

		dot = Math.min(Math.max(dot, -1.0), 1.0);
		if (dot == 1.0) {
			qR = frame.copy(qA);
			return qR;
		}

		theta = Math.acos(dot);
		w = Math.sin(t * theta) * 1 / Math.sqrt(1 - dot * dot);
		for (var i = 0; i < 4; i++) {
			a = qA[i] * (Math.cos(t * theta) - dot * w);
			b = qB[i] * w;
			qR[i] = a + b;
		}
		return qR;
	},

	/**
	* @public
	* @params t: time, points: knot and control points, vR: resulting point
	*/
	getBezier: function (t, points, vR) {
		if (!vR) vR = [];

		var i, j,
			c = points.length,
			l = points[0].length,
			lastIndex = (c - 1),
			endPoint = points[lastIndex],
			values = this.getBezierValues(t, lastIndex);

		for (i = 0; i < l; i++) {
			vR[i] = 0;
			for (j = 0; j < c; j++) {
				if ((j > 0) && (j < (c - 1))) {
					vR[i] = vR[i] + (points[j][i] * endPoint[i] * values[j]);
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
	getCoeff: function (n, k) {
		n = parseInt(n);
		k = parseInt(k);
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
	getBezierValues: function (t, n) {
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