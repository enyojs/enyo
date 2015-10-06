require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Layout~Layout} kind.
* @module enyo/Layout
*/

var
	kind = require('./kind');

/**
* {@link module:enyo/Layout~Layout} is the base [kind]{@glossary kind} for layout
* kinds. Layout kinds are used by {@link module:enyo/UiComponent~UiComponent}-based
* [controls]{@link module:enyo/Control~Control} to allow for arranging of child controls by
* setting the [layoutKind]{@link module:enyo/UiComponent~UiComponent#layoutKind} property.
* 
* Derived kinds will usually provide their own
* [layoutClass]{@link module:enyo/Layout~Layout#layoutClass} property to affect the CSS
* rules used, and may also implement the [flow()]{@link module:enyo/Layout~Layout#flow}
* and [reflow()]{@link module:enyo/Layout~Layout#reflow} methods. `flow()` is called
* during control rendering, while `reflow()` is called when the associated
* control is resized.
*
* @class Layout
* @public
*/
module.exports = kind(
	/** @lends module:enyo/Layout~Layout.prototype */ {

	name: 'enyo.Layout',

	/**
	* @private
	*/
	kind: null,

	/** 
	* CSS class that's added to the [control]{@link module:enyo/Control~Control} using this 
	* [layout]{@link module:enyo/Layout~Layout} [kind]{@glossary kind}.
	*
	* @type {String}
	* @default ''
	* @public
	*/
	layoutClass: '',
	
	/**
	* @private
	*/
	constructor: function (container) {
		this.container = container;
		if (container) {
			container.addClass(this.layoutClass);
		}
	},

	/**
	* @private
	*/
	destroy: function () {
		if (this.container) {
			this.container.removeClass(this.layoutClass);
		}
	},
	
	/**
	* Called during static property layout (i.e., during rendering).
	*
	* @public
	*/
	flow: function () {
	},

	/** 
	* Called during dynamic measuring layout (i.e., during a resize).
	*
	* May short-circuit and return `true` if the layout needs to be
	* redone when the associated Control is next shown. This is useful
	* for cases where the Control itself has `showing` set to `true`
	* but an ancestor is hidden, and the layout is therefore unable to
	* get accurate measurements of the Control or its children.
	*
	* @public
	*/
	reflow: function () {
	}
});
