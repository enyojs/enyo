require('enyo');

var
	kind = require('../kind'),
	actor = require('./Actor'),
	scene = require('./Scene');

var extend = kind.statics.extend;

kind.concatenated.push('animation');

var AnimationSupport = {
	/**
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			var parent = this.scene.isScene && this.scene;
			if (parent) {
				this.scene = actor(this.scene, this);
				this.scene.repeat = parent.repeat;
				scene.link(this, parent);
			} else {
				scene.link(this, this.scene);
			}
		};
	}),

	/**
	* @private
	*/
	rendered: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
		};
	}),
	
	/**
	 * @private
	 */
	destroy: kind.inherit(function(sup) {
		return function() {
			this.scene && this.scene.stop();
			this.scene = undefined;
			sup.apply(this, arguments);
		};
	})
};

module.exports = AnimationSupport;

/**
	Hijacking original behaviour as in other Enyo supports.
*/
var sup = kind.concatHandler;

/**
* @private
*/
kind.concatHandler = function (ctor, props, instance) {
	sup.call(this, ctor, props, instance);
	if (props.scene) {
		var proto = ctor.prototype || ctor;
		extend(AnimationSupport, proto);
	}
};