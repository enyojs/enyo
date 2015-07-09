require('enyo');

/**
* Contains the declaration for the {@link module:enyo/ObserverChainNode~ObserverChainNode} kind.
* @module enyo/ObserverChainNode
*/

var
	kind = require('./kind');

var
	LinkedListNode = require('./LinkedListNode');

function get (base, prop) {
	return base && /*isObject(base)*/ (typeof base == 'object')? (
		base.get? base.get(prop): base[prop]
	): undefined;
}

/**
* An internally used {@glossary kind}.
*
* @class ObserverChainNode
* @extends module:enyo/LinkedListNode~LinkedListNode
* @private
*/
module.exports = kind(
	/** @lends module:enyo/ObserverChainNode~ObserverChainNode.prototype */ {

	/**
	* @private
	*/
	kind: LinkedListNode,

	/**
	* @private
	*/

	
	/**
	* @method
	* @private
	*/
	constructor: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.connect();
		};
	}),
	
	/**
	* @method
	* @private
	*/
	destroy: kind.inherit(function (sup) {
		return function () {
			this.disconnect();
			sup.apply(this, arguments);
			this.observer = null;
			this.list = null;
			this.object = null;
		};
	}),
	
	/**
	* @private
	*/
	connect: function () {
		var obj = this.object
			, obs = this._changed
			, prop = this.property;
		if (obj) {
			if (obj.observe) obj.observe(prop, obs, this, {noChain: true, priority: true});
			this.connected = true;
			this.list.connected++;
		}
	},
	
	/**
	* @private
	*/
	disconnect: function () {
		var obj = this.object
			, obs = this._changed
			, prop = this.property
			, was = this.connected;
		obj && obj.unobserve && obj.unobserve(prop, obs, this);
		this.connected = null;
		if (was) this.list.connected--;
	},
	
	/**
	* @private
	*/
	setObject: function (object) {
		var cur = this.object
			, prop = this.property
			, was, is;
		
		if (cur !== object) {
			this.disconnect();
			this.object = object;
			this.connect();
			
			if (this.list.tail === this) {
				was = get(cur, prop);
				is = get(object, prop);
				// @TODO: It would be better to somehow cache values
				// such that it could intelligently derive the difference
				// without needing to continuously look it up with get
				was !== is && this.list.observed(this, was, is);
			}
		}
	},
	
	/**
	* @private
	*/
	_changed: function (was, is) {
		this.list.observed(this, was, is);
	}
});
