require('enyo');

var
	kind = require('../kind'),
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
			scene.link(this, this.scene);
			console.log("comp : " + this.name + " linked to :", this.scene);
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
			scene.delink(this, this.scene);
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