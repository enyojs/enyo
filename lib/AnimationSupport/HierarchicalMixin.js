require('enyo');

var
	kind = require('../kind'),
	Dom = require('../dom'),
	animation = require('./Core'),
	VerticalDelegate = require('../VerticalDelegate');

/**
* A mixin support for Hierarchical components
* @module enyo/HierarchicalMixin
*/
module.exports = {
	/**
	* @private
	*/
	_pageScrolltop: 0,

	/**
	* @private
	*/
	_paged: false,

	/**
	* Mixin creation
	*
	* @method
	* @private
	*/
	create: kind.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this.addListener('paging', this._pagingHandler.bind(this));
			this.clientHeight = Dom.getWindowHeight();
		};
	}),

	/**
	* Mixin creation
	*
	* @method
	* @private
	*/
	didScroll: kind.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			var top = event ? event.scrollBounds.top : 0;
			if (this._paged) {
				this._pageScrolltop = top;
				this._paged = false;
			}
			this._animateChild(this.controls,  event ? event.scrollBounds.top - this._pageScrolltop: 0);
		};
	}),

	/**
	* Handler for pagging event when its triggered from vertical delegate of data grid list
	*
	* @method
	* @private
	*/
	_pagingHandler: function() {
		this._paged = true;
		for (var i=0, node; (node = this.controls[i]); i++) {
			node._bounds = node.getAbsoluteBounds();
		}
	},

	/**
	* Apply animation on all the child nodes which are visible inside the viewport
	*
	* @method
	* @private
	*/
	_animateChild: function(nodes, top) {
		var showing;
		for (var i=0, node; (node = nodes[i]); i++) {
			showing = this._getNodeShowing(node, top);
			if (node.hasNode() && showing && !node.animating) {
				node.start(true);
			}
		}
	},

	/**
	* Checks if the node element in visible inside the viewport
	*
	* @method
	* @private
	*/
	_getNodeShowing: function(node, top) {
		var showing, rect = node._bounds;
		if (rect) {
			showing = ((rect.top >= top) && ((rect.top - top) <= this.clientHeight));
		} else {
			showing = false;
		}
		return showing;
	}
};

/**
	Hijacking original behaviour of delegates.
*/
var	sup = VerticalDelegate.generate;

VerticalDelegate.generate = function(list) {
	sup.call(this, list);
	for (var i=0, p; (p=list.pages[i]); ++i) {
		for (var j=0, c; (c=p.children[j]); ++j) {
			c._bounds = c.getAbsoluteBounds();
			c.animate = list.animate;
			c.duration = list.duration;
			animation.trigger(c);
			if (list._getNodeShowing(c, 0)) {
				c.start(true);
			}
		}
	}
};