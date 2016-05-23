/**
* Contains methods useful for animations.
* @module enyo/animation
*/

require('enyo');

var
	platform = require('./platform'),
	utils = require('./utils');

var ms = Math.round(1000/60),
	prefix = ['', 'webkit', 'moz', 'ms', 'o'],
	rAF = 'requestAnimationFrame',
	cRAF = 'cancelRequestAnimationFrame',
	cAF = 'cancelAnimationFrame',
	i, pl, p, wcRAF, wrAF, wcAF,
	_requestFrame, _cancelFrame, cancelFrame,
	core = { ts: 0, obs: {}};


/*
* Fallback on setTimeout
*
* @private
*/
_requestFrame = function(callback) {
	return global.setTimeout(callback, ms);
};

/*
* Fallback on clearTimeout
*
* @private
*/
_cancelFrame = function(id) {
	return global.clearTimeout(id);
};

for (i = 0, pl = prefix.length; (p = prefix[i]) || i < pl; i++) {
	// if we're on ios 6 just use setTimeout, requestAnimationFrame has some kinks
	if (platform.ios === 6) {
		break;
	}

	// if prefixed, becomes Request and Cancel
	wrAF = p ? (p + utils.cap(rAF)) : rAF;
	wcRAF = p ? (p + utils.cap(cRAF)) : cRAF;
	wcAF = p ? (p + utils.cap(cAF)) : cAF;

	// Test for cancelRequestAnimationFrame, because some browsers (Firefix 4-10) have a request without a cancel
	cancelFrame = global[wcAF] || global[wcRAF];
	if (cancelFrame) {
		_cancelFrame = cancelFrame;
		_requestFrame = global[wrAF];
		if (p == 'webkit') {
			/*
				Note: In Chrome, the first return value of webkitRequestAnimationFrame is 0.
				We make 1 bogus call so the first used return value of webkitRequestAnimationFrame is > 0, as the spec requires.
				This makes it so that the requestId is always truthy.
				(we choose to do this rather than wrapping the native function to avoid the overhead)
			*/
			_cancelFrame(_requestFrame(utils.nop));
		}
		break;
	}
}
/**
* Requests an animation callback.
*
* On compatible browsers, if `node` is defined, the [callback]{@glossary callback} will
* fire only if `node` is visible.
*
* @param {Function} callback - A [callback]{@glossary callback} to be executed on the
*                            animation frame.
* @param {Node} node - The DOM node to request the animation frame for.
* @returns {Object} A request id to be used with
*                     {@link module:enyo/animation#cancelRequestAnimationFrame}.
* @public
*/
exports.requestAnimationFrame = function(callback, node) {
	return _requestFrame(callback, node);
};
/**
* Cancels a requested animation callback with the specified id.
*
* @param {Number} id - The identifier of an animation request we wish to cancel.
* @deprecated since 2.7.0
* @public
*/
exports.cancelRequestAnimationFrame = function(id) {
	return _cancelFrame(id);
};
/**
* Cancels a requested animation callback with the specified id.
*
* @param {Number} id - The identifier of an animation request we wish to cancel.
* @public
*/
exports.cancelAnimationFrame = function(id) {
	return _cancelFrame(id);
};
/**
* Subcribes for animation frame ticks.
*
* @param {Object} ctx - The context on which callback is registered.
* @param {Function} callback - A [callback]{@glossary callback} to be executed on tick.
* @public
*/
exports.subscribe = function(ctx,callback) {
	var id = utils.uid("rAF");
	core.obs[id]=utils.bindSafely(ctx, callback);
	return id;
};
/**
* Unsubcribes for animation frame ticks.
*
* @param {Object} node - The context on which callback is registered.
* @param {Function} callback - A [callback]{@glossary callback} to be executed on tick.
* @public
*/
exports.unsubscribe = function(id) {
	delete core.obs[id];
};

var startrAF = function(){
	_requestFrame(function (time) {
		startrAF();
		core.ts = time;
	}.bind(this));
};
startrAF();

/**
* Gives an interpolation of an animated transition's distance from 0 to 1.
*
* Given a start time (`t0`) and an animation duration (`duration`), this
* method applies the `easing` function to the percentage of time elapsed
* divided by duration, capped at 100%.
*
* @param {Number} t0 - Start time.
* @param {Number} duration - Duration in milliseconds.
* @param {Function} easing - An easing [function]{@glossary Function} reference from
*	{@link module:enyo/animation#easing}.
* @param {Boolean} reverse - Whether the animation will run in reverse.
* @returns {Number} The resulting position, capped at a maximum of 100%.
* @public
*/
exports.easedLerp = function(t0, duration, easing, reverse) {
	var lerp = (utils.perfNow() - t0) / duration;
	if (reverse) {
		return lerp >= 1 ? 0 : (1 - easing(1 - lerp));
	} else {
		return lerp >= 1 ? 1 : easing(lerp);
	}
};

/**
* Gives an interpolation of an animated transition's distance from
* `startValue` to `valueChange`.
*
* Applies the `easing` function with a wider range of variables to allow for
* more complex animations.
*
* @param {Number} t0 - Start time.
* @param {Number} duration - Duration in milliseconds.
* @param {Function} easing - An easing [function]{@glossary Function} reference from
*	{@link module:enyo/animation#easing}.
* @param {Boolean} reverse - Whether the animation will run in reverse.
* @param {Number} time
* @param {Number} startValue - Starting value.
* @param {Number} valueChange
* @returns {Number} The resulting position, capped at a maximum of 100%.
* @public
*/
exports.easedComplexLerp = function(t0, duration, easing, reverse, time, startValue, valueChange) {
	var lerp = (utils.perfNow() - t0) / duration;
	if (reverse) {
		return easing(1 - lerp, time, startValue, valueChange, duration);
	} else {
		return easing(lerp, time, startValue, valueChange, duration);
	}
};


//TODO: A temporary implementation for rAF with observers.
Object.defineProperty(core, 'ts', {

	get: function() { 
		return this.value; 
	},

	set: function(newValue) {
		for(var i in this.obs){
			this.obs[i](this.value, newValue);
		}
		this.value = newValue;
	}
});