require('enyo');

/**
* Contains the declaration for the {@link module:enyo/LinkedList~LinkedList} kind.
* @module enyo/LinkedList
*/

var
	kind = require('./kind');

var
	LinkedListNode = require('./LinkedListNode');

/**
* An abstract linked-list.
*
* @class LinkedList
* @private
*/
module.exports = kind(
	/** @lends module:enyo/LinkedList~LinkedList.prototype */ {
	
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
	nodeKind: LinkedListNode,
	
	/**
	* @private
	*/
	head: null,
	
	/**
	* @private
	*/
	tail: null,
	
	/**
	* @private
	*/
	length: 0,
	
	/**
	* @private
	*/
	clear: function () {
		if (this.head) {
			// this will trigger a chain event down the list
			this.head.destroy();
		}
		this.head = null;
		this.tail = null;
		this.length = 0;			
	},
	
	/**
	* @private
	*/
	slice: function (fromNode, toNode) {
		var node = fromNode || this.head
			, list = new this.ctor()
			, cpy;
		
		// ensure we have a final node or our tail
		toNode = toNode || this.tail;
		
		if (node && node !== toNode) {
			do {
				cpy = node.copy();
				list.appendNode(cpy);
			} while ((node = node.next) && node !== toNode);
		}
		
		return list;
	},
	
	/**
	* @private
	*/
	destroy: function () {
		this.clear();
		this.destroyed = true;
	},
	
	/**
	* @private
	*/
	createNode: function (props) {
		return new this.nodeKind(props);
	},
	
	/**
	* @private
	*/
	deleteNode: function (node) {
		this.removeNode(node);
		
		// can't chain destruct because we removed its chain references
		node.destroy();
		return this;
	},
	
	/**
	* @private
	*/
	removeNode: function (node) {
		var prev = node.prev
			, next = node.next;
			
		prev && (prev.next = next);
		next && (next.prev = prev);
		this.length--;
		node.next = node.prev = null;
		return this;
	},
	
	/**
	* @private
	*/
	appendNode: function (node, targetNode) {
		targetNode = targetNode || this.tail;
		
		if (targetNode) {
			if (targetNode.next) {
				node.next = targetNode.next;
			}
			
			targetNode.next = node;
			node.prev = targetNode;
			
			if (targetNode === this.tail) {
				this.tail = node;
			}
			
			this.length++;
		} else {
			
			this.head = this.tail = node;
			node.prev = node.next = null;
			this.length = 1;
		}
		return this;
	},
	
	/**
	* @private
	*/
	find: function (fn, ctx, targetNode) {
		var node = targetNode || this.head;
		if (node) {
			do {
				if (fn.call(ctx || this, node, this)) {
					return node;
				}
			} while ((node = node.next));
		}
		// if no node qualified it returns false
		return false;
	},
	
	/**
	* @private
	*/
	forward: function (fn, ctx, targetNode) {
		var node = targetNode || this.head;
		if (node) {
			do {
				if (fn.call(ctx || this, node, this)) {
					break;
				}
			} while ((node = node.next));
		}
		// returns the last node (if any) that was processed in the chain
		return node;
	},
	
	/**
	* @private
	*/
	backward: function (fn, ctx, targetNode) {
		var node = targetNode || this.tail;
		if (node) {
			do {
				if (fn.call(ctx || this, node, this)) {
					break;
				}
			} while ((node = node.prev));
		}
		// returns the last node (if any) that was processed in the chain
		return node;
	},
	
	/**
	* @private
	*/
	constructor: function () {
		this.nodeType = kind.constructorForKind(this.nodeType);
	}
});
