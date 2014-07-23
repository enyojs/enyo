(function (enyo, scope) {
	/**
	* {@link enyo.Layout} is the base [kind]{@glossary kind} for layout
	* kinds. Layout kinds are used by {@link enyo.UiComponent}-based
	* [controls]{@link enyo.Control} to allow for arranging of child controls by
	* setting the [layoutKind]{@link enyo.UiComponent#layoutKind} property.
	* 
	* Derived kinds will usually provide their own
	* [layoutClass]{@link enyo.Layout#layoutClass} property to affect the CSS
	* rules used, and may also implement the [flow()]{@link enyo.Layout#flow}
	* and [reflow()]{@link enyo.Layout#reflow} methods. `flow()` is called
	* during control rendering, while `reflow()` is called when the associated
	* control is resized.
	*
	* @class enyo.Layout
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Layout.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Layout',

		/**
		* @private
		*/
		kind: null,

		/** 
		* CSS class that's added to the [control]{@link enyo.Control} using this 
		* [layout]{@link enyo.Layout} [kind]{@glossary kind}.
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
		* @public
		*/
		reflow: function () {
		}
	});

})(enyo, this);
