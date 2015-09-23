require('enyo');

var 
	frame = require('./Frame'),	
	utils = require('../utils'),
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
		if (since < dur) {
			t = since / dur;
			this.step(charc, t);
		} else {
			this.step(charc);
		}
	},

	updateDelta: function (charc, d) {
		var k, cV, sV, oV, mod, end = {}, dist, totdist, rev;
		var prop = charc.getAnimation();

		d = d || charc.animDelta;
		charc.reverse = false;
		for (k in prop) {
			oV = charc._startAnim[k];
			cV = charc.currentState && charc.currentState[k] || frame.copy(oV);
			
			sV = utils.isString(prop[k]) ? frame.parseValue(prop[k]) : prop[k];
			sV = k == 'rotate' ? Vector.toQuant(sV) : sV;

			if(!d || d.length <= 0) {
				end[k] = sV[k];
				continue;
			}

			totdist = (k == 'rotate' ? Vector.quantDistance : Vector.distance)(sV, oV);
			dist = (k == 'rotate' ? Vector.quantDistance : Vector.distance)(sV, cV);
			if (dist === 0) {
				charc._startAnim[k] = frame.copy(sV);
				end[k] || delete end[k];
			} else if (totdist > 0 && dist > totdist) {
				end[k] || delete end[k];
			} else {
				mod = this.propertyModifier(charc, k, d);
				rev = Vector.direction(sV, cV);

				if (rev) {
					cV =  Vector.quantInverse(cV);
					end[k] = k === 'rotate' ? Vector.quantCross(cV, mod) : Vector.add(frame.copy(cV), mod);
					end[k] = Vector.quantInverse(end[k]);
				} else {
					end[k] = k === 'rotate' ? Vector.quantCross(mod, cV) : Vector.add(frame.copy(cV), mod);
				}
			}
		}

		if (Object.keys(end).length === 0) {
			charc.animating = false;
			return;
		}

		utils.mixin(charc._endAnim, end);
		this.step(charc);
		charc.animDelta = [];
	},

	/**
	* @private
	*/
	step: function(charc, t) {
		var k, c;

		node = charc.node;
		newState = charc._endAnim;
		oldState = charc._startAnim;
		charc.currentState = charc.currentState || {};

		for (k in newState) {
			cState = frame.copy(charc.currentState[k] || []);
			c = k == 'rotate'? this.slerp : this.lerp;
			cState = t ? c(oldState[k], newState[k], this.ease(t), cState) : newState[k];
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
	},

	/**
	* @private
	*/
	ease: function (t) {
		return t;
	},
	
	complete: function (charc) {
		charc.animating = false;
		charc._prop = undefined;
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

	propertyModifier: function (c, p, d) {
		var dP = (d instanceof Array) ? frame.copy(d) : [d, 0, 0];

		if (frame.isTransform(p)) {
			if (c.transformModifier)
				dP = c.transformModifier(p, dP);
			this.transformModifier(c, p, dP);
		}

		this.fire(c, 'onPropertyModify', {property: p, change: dP});
		return dP;
	},

	transformModifier: function (c, p, d) {
		if(p == 'rotate') {
			return Vector.toQuant(d);
		}
		return d;
	},

	isCompleted: function (cV, eV) {
		if (Vector.equals(cV, eV)) return 0;
		else if (Vector.greater(cV, eV)) return 1;
		else return -1;
	},

	fire: function (ctx, name, ev) {
		var fn = ctx[name];
		if (utils.isString(fn)) {
			ctx.bubble(name, ev);
		} else if (fn) {
			fn.call(ctx, ev);
		}
	}
};