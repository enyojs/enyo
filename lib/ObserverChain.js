require('enyo');

/**
* Contains the declaration for the {@link module:enyo/ObserverChain~ObserverChain} kind.
* @module enyo/ObserverChain
*/

var
	kind = require('./kind');

var
	LinkedList = require('./LinkedList'),
	ObserverChainNode = require('./ObserverChainNode');

function get (base, prop) {
	return base && /*isObject(base)*/ (typeof base == 'object')? (
		base.get? base.get(prop): base[prop]
	): undefined;
}

/**
* An internally used {@glossary kind}.
*
* @class ObserverChain
* @extends module:enyo/LinkedList~LinkedList
* @private
*/
module.exports = kind(
	/** @lends module:enyo/ObserverChain~ObserverChain.prototype */ {

	/**
	* @private
	*/
	kind: LinkedList,

	/**
	* @private
	*/
	nodeKind: ObserverChainNode,

	/**
	* @private
	*/

	
	/**
	* @private
	*/
	connected: 0,
	
	/**
	* @method
	* @private
	*/
	constructor: function (path, object) {
		this.object = object;
		this.path = path;
		this.parts = path.split('.');
		this.createChain();
	},
	
	/**
	* @method
	* @private
	*/
	destroy: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.object = null;
			this.parts = null;
			this.path = null;
		};
	}),
	
	/**
	* @private
	*/
	rebuild: function (target) {
		if (!this.rebuilding) {
			this.rebuilding = true;
			this.forward(function (node) {
				if (node !== this.head) {
					var src = node.prev.object
						, prop = node.prev.property;
					node.setObject(get(src, prop));
				}
			}, this, target);
			this.rebuilding = false;
		}
	},
	
	/**
	* @private
	*/
	isConnected: function () {
		return !! (this.connected === this.length && this.length);
	},
	
	/**
	* @private
	*/
	buildPath: function (target) {
		var str = '';
		
		this.backward(function (node) {
			str = node.property + (str? ('.' + str): str);
		}, this, target);
		
		return str;
	},
	
	/**
	* @private
	*/
	createChain: function () {
		var parts = this.parts
			, next = this.object
			, $ = false
			, node, prop;
			
		for (var i=0; (prop=parts[i]); ++i) {
			
		// forEach(parts, function (prop, idx) {
			// we create a special case for the $ hash property
			if (prop == '$') {
				$ = true;
			} else {
				// in cases where the chain has the $ property we arbitrarily
				// force it onto our current nodes property and let the special handling
				// in ObserverChainNode and ObserverSupport handle the rest
				$ && (prop = '$.' + prop);
				node = this.createNode({property: prop, object: next, list: this});
				this.appendNode(node);
				next = get(next, prop);
				$ = false;
			}
		// }, this);
		}
	},
	
	/**
	* @private
	*/
	observed: function (node, was, is) {
		this.object.stopNotifications();
		// @NOTE: About the following two cases, they are mutually exclusive and this seems perfect
		// that we don't see double notifications
		// @TODO: Only notify if it was the full property path? This is far more efficient after
		// testing but not as flexible...
		node === this.tail /*&& was !== is*/ && this.object.notify(this.buildPath(node), was, is);
		// @TODO: It seems the same case across the board that the rebuild only needs to take place
		// from the beginning to the second-to-last elem
		node !== this.tail && was !== is && this.rebuild(node);
		this.object.startNotifications();
	}
});
