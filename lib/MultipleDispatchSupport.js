/**
* Exports the {@link module:enyo/MultipleDispatchSupport~MultipleDispatchSupport} mixin.
* @module enyo/MultipleDispatchSupport
*/

require('enyo');

var
	kind = require('./kind'),
	utils = require('./utils');

/**
* A collection of methods to allow a single {@link module:enyo/Component~Component} to
* [dispatch]{@link module:enyo/Component~Component#dispatchEvent} a single {@glossary event} to
* multiple targets. The events are synchronously propagated in the order in
* which the targets are encountered. Note that this {@glossary mixin} is
* already applied to a base [kind]{@glossary kind},
* {@link module:enyo/MultipleDispatchComponent~MultipleDispatchComponent}.
*
* @mixin
* @public
*/
var MultipleDispatchSupport = {
	
	/**
	* @private
	*/
	name: 'MultipleDispatchSupport',
	
	/**
	* Adds a target for dispatching.
	*
	* @param {module:enyo/Component~Component} component - The {@link module:enyo/Component~Component} to add as a dispatch target.
	* @public
	*/
	addDispatchTarget: function (component) {
		var dt = this._dispatchTargets;
		if (component && !~utils.indexOf(component, dt)) {
			dt.push(component);
		}
	},
	/**
	* Removes a target from dispatching.
	*
	* @param {module:enyo/Component~Component} component - The {@link module:enyo/Component~Component} to remove as a dispatch
	*	target.
	* @public
	*/
	removeDispatchTarget: function (component) {
		var dt = this._dispatchTargets, i;
		i = utils.indexOf(component, dt);
		if (i > -1) {
			dt.splice(i, 1);
		}
	},
	
	/**
	* @private
	*/
	bubbleUp: kind.inherit(function (sup) {
		return function (name, event, sender) {
			if (this._dispatchDefaultPath) {
				sup.apply(this, arguments);
			}
			var dt = this._dispatchTargets;
			for (var i=0, t; (t=dt[i]); ++i) {
				if (t && !t.destroyed) {
					t.dispatchBubble(name, event, sender);
				}
			}
		};
	}),
	
	/**
	* @private
	*/
	ownerChanged: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			var o = this.owner;
			this._dispatchDefaultPath = !! o;
		};
	}),
	
	/**
	* @private
	*/
	constructor: kind.inherit(function (sup) {
		return function () {
			this._dispatchTargets = [];
			return sup.apply(this, arguments);
		};
	}),
	
	/**
	* @private
	*/
	destroy: kind.inherit(function (sup) {
		return function () {
			this._dispatchTargets = null;
			sup.apply(this, arguments);
		};
	}),
	
	/**
	* @private
	*/
	_dispatchDefaultPath: false
};

module.exports = MultipleDispatchSupport;
