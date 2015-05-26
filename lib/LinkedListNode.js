require('enyo');

/**
* Contains the declaration for the {@link enyo.LinkedListNode} kind.
* @module enyo/LinkedListNode
*/

var
	kind = require('./kind'),
	utils = require('./utils');

/**
* An abstract linked-list node.
*
* @namespace enyo
* @class enyo.LinkedListNode
* @definedby module:enyo/LinkedListNode
* @private
*/
module.exports = kind(
	/** @lends enyo.LinkedListNode.prototype */ {
	
	/**
	* @private
	*/
	kind: null,
	
	/**
	* @private
	*/

	
	/**
	* @private
	*/
	prev: null,
	
	/**
	* @private
	*/
	next: null,
	
	/**
	* @private
	*/
	copy: function () {
		var cpy = new this.ctor();
		cpy.prev = this.prev;
		cpy.next = this.next;
		return cpy;
	},
	
	/**
	* @private
	*/
	constructor: function (props) {
		props && utils.mixin(this, props);
	},
	
	/**
	* @private
	*/
	destroy: function () {
		// clear reference to previous node
		this.prev = null;
		
		// if we have a reference to our next node
		// we continue down the chain
		this.next && this.next.destroy();
		
		// clear our reference to the next node
		this.next = null;
	}
});
