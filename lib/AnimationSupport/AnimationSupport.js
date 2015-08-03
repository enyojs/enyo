
require('enyo');

var
	kind = require('../kind'),
	activator = require('./KeyFrame'),
	frame = require('./Frame'),
	utils = require('../utils');

var extend = kind.statics.extend;

kind.concatenated.push('animation');

var AnimationSupport = {
	
	/**
	* @private
	*/
	//name: 'AnimationSupport',
	animating: false,

	/**
	* @private
	*/
	ready: function() {
		return this.generated && this.animating;
	},

	/**
	* @private
	*/
	setInitial: function (initial) {
		this._start = initial;
	},

	/**
	* @private
	*/
	getDom: function() {
		return this.hasNode && this.hasNode();
	},

	/**
	* @private
	*/
	getProperty: function() {
		return this._prop || (this._prop = this.animate);
	},

	/**
	* @private
	*/
	setProperty: function (newProp) {
		this._prop = newProp;
	},

	/**
	* @private
	*/
	getDuration: function() {
		return this._duration || (this._duration = this.duration);
	},

	/**
	* @private
	*/
	setDuration: function (newDuration) {
		this._duration = newDuration;
	},

	/**
	* @private
	*/
	completed: function() {
		return this.onAnimated && this.onAnimated(this);
	},

	/**
	* @public
	*/
	start: function () {
		this._duration = parseInt(this.getDuration(), 10);
		this._startTime = utils.perfNow();
		this._lastTime = this._startTime + this._duration;
		this.animating = true;
	},

	/**
	* @public
	*/
	stop: function () {
		this.animating = false;
	},

	/**
	* @private
	*/
	rendered: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			var dom = this.hasNode(),
				prop = this.getProperty();
			if(dom && prop) {
				var init = frame.getCompoutedProperty(dom, prop, this._start);
				utils.mixin(this, init);
				frame.accelerate(dom, this.matrix);
			}
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
	if (props.animate || props.keyFrame) {
		var proto = ctor.prototype || ctor;
		extend(AnimationSupport, proto);
		if (props.keyFrame && typeof props.keyFrame != 'function') {
			activator.animate(proto, props);
		}
		if (props.animate && typeof props.animate != 'function') {
			activator.trigger(proto);
		}
	}
};