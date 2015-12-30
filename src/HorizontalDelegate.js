require('enyo');

var
	utils = require('./utils'),
	kind = require('./kind');
var
	VerticalDelegate = require('./VerticalDelegate');

/**
* This is a [delegate]{@glossary delegate} (strategy) used by {@link module:enyo/DataList~DataList}
* for horizontally-oriented lists. This is used by all lists for this strategy;
* it does not get copied, but is called directly from the list.
*
* Note that this is based on the [vertical delegate]{@link module:enyo/VerticalDelegate}
* and shares most of that delegate's logic. Overloads are implemented only where necessary.
*
* @module enyo/HorizontalDelegate
* @private
*/
var p = utils.clone(VerticalDelegate);
kind.extendMethods(p, {
	/** @lends module:enyo/HorizontalDelegate */

	/**
	* Initializes the list, adding a class to modify the CSS properly and setting its
	* priority properties.
	*
	* @method
	* @private
	*/
	initList: kind.inherit(function (sup) {
		return function (list) {
			sup.apply(this, arguments);
			// add the class
			list.addClass('horizontal');
			// set the priority properties
			list.posProp   = list.rtl ? 'right' : 'left';
			list.upperProp = 'left';
			list.lowerProp = 'right';
			list.psizeProp = 'width';
			list.ssizeProp = 'height';
			// set the scroller options
			var so         = list.scrollerOptions? (list.scrollerOptions = utils.clone(list.scrollerOptions)): (list.scrollerOptions = {});
			// this is a horizontal list it cannot scroll vertically
			so.vertical    = 'hidden';
			// it has to scroll vertically one way or another
			so.horizontal  = so.horizontal == 'scroll'? 'scroll': 'auto';
		};
	}),

	/*
	* @private
	*/
	destroyList: function (list) {
		if (list) {
			list.removeClass('horizontal');
		}
	},
	/**
	* Overload to retrieve the correct scroll position.
	*
	* @private
	*/
	getScrollPosition: function (list) {
		return list.$.scroller.getScrollLeft();
	},

	/**
	* Sets the scroll position on the [scroller]{@link module:enyo/Scroller~Scroller}
	* owned by the given list.
	*
	* @private
	*/
	setScrollPosition: function (list, pos) {
		list.$.scroller.setScrollLeft(pos);
	},
	
	/**
	* Overload to ensure we arbitrarily resize the active container to the width of the buffer.
	*
	* @method
	* @private
	*/
	adjustBuffer: kind.inherit(function (sup) {
		return function (list) {
			sup.apply(this, arguments);
			var an = list.$.active.node || list.$.active.hasNode(),
				bs = list.bufferSize;
			if (an) {
				an.style.width = bs + 'px';
			}
		};
	})
}, true);

module.exports = p;
