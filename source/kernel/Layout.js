(function (enyo, scope) {
	/**
	* _enyo.Layout_ is the base [kind]{@glossary kind} for layout [kinds]{@glossary kind}. These are
	* used by {@link enyo.UiComponent}-based [controls]{@link enyo.Control} to allow for arranging 
	* of the children by setting the [_layoutKind_]{@link enyo.UiComponent#layoutKind} property.
	* 
	* Derived [kinds]{@glossary kind} will usually provide their own 
	* [_layoutClass_]{@link enyo.Layout#layoutClass} property to affect the CSS rules used, and may 
	* also implement the [_flow_]{@link enyo.Layout#flow} and [_reflow_]{@link enyo.Layout#reflow} 
	* methods. [_flow_]{@link enyo.Layout#flow} is called during [control]{@link enyo.Control} 
	* rendering, while [_reflow_]{@link enyo.Layout#reflow} is called when the associated 
	* [control]{@link enyo.Control} is resized.
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
		constructor: function(inContainer) {
			this.container = inContainer;
			if (inContainer) {
				inContainer.addClass(this.layoutClass);
			}
		},

		/**
		* @private
		*/
		destroy: function() {
			if (this.container) {
				this.container.removeClass(this.layoutClass);
			}
		},
		
		/**
		* Called during static property layout (i.e. during rendering).
		*
		* @public
		*/
		flow: function() {
		},

		/** 
		* Called during dynamic measuring layout (i.e. during a resize).
		*
		* @public
		*/
		reflow: function() {
		}
	});

})(enyo, this);
