require('enyo');

var 
	frame = require('./Frame');
/**
* Animator is a module responsible for animation happening on a Character(described below).
* The responsibilities of this module is to;
*	1. Create new characters for animation.
*	2. Add new characters who are willing to get animated.
*	3. Interpolating current state of character.
*	4. Update DOM based on current state, using matrix for tranform and styles for others.
*
* As of now this module is exposed as an interface for application 
* to directly trigger an animation. However, this will be later made private
* and will be accessible only by other interfaces exposed by framework.
*
* @public
*/
module.exports = {
	/**
	* Animator public API which notifies Animator to change current state of 
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
		if (since < dur) {
			t = since / dur;
			this.step(charc, t);
		} else {
			this.step(charc);
		}
	},

	/**
	* @private
	*/
	step: function(charc, t) {
		var key, i,
			matrix,
			start, end,
			states = [],
			dom = charc.getDom(),
			prop = charc.getProperty(),
			fMatrix = frame.IDENTIY,
			iMatrix = charc._matrix || frame.IDENTIY;

		charc.currentState = {};
		for (key in prop) {
			start = charc._start[key];
			end = charc._end[key];
			for (i = 0; i < end.length; i++) {
				states[i] = t ? this.interpolate(start[i], end[i], this.ease(t)): end[i];
			}
			if (frame.isTransform(key)) {
				matrix = frame[key](states[0], states[1], states[2]);
				fMatrix = frame.multiply(matrix, iMatrix);
				iMatrix = fMatrix;
			} else {
				frame.setProperty(dom, key, states);
			}
			charc.currentState[key] = states;
		}

		if (fMatrix) this.accelerate(dom, fMatrix);
	},

	/**
	* @private
	*/
	ease: function (t) {
		return t;
	},

	/**
	* @private
	*/
	interpolate: function(a, b, t) {
		a = parseFloat(a || 0, 10);
		b = parseFloat(b || 0, 10);
		return ((1 - t) * a) + (t * b);
	},

	/**
	* @private
	*/
	accelerate: function (ele, m) {
		m = m ? m : frame.IDENTIY;
		frame.setTransformProperty(ele, m);
	}
};