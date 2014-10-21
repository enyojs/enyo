(function (enyo, scope) {

	/**
	* {@link enyo.Scrim} provides an overlay that will prevent taps from propagating
	* to the controls that it covers.  A scrim may be "floating" or "non-floating".
	* A floating scrim will fill the entire viewport, while a non-floating scrim will
	* be constrained by the dimensions of its container.
	*
	* The scrim should have a CSS class of `enyo-scrim-transparent`,
	* `enyo-scrim-translucent`, or any other class that has
	* `pointer-events: auto` in its style properties.
	*
	* You may specify the `z-index` at which you want the scrim to appear by calling
	* [showAtZIndex()]{@link enyo.Scrim#showAtZIndex}. If you do so, you must call
	* [hideAtZIndex()]{@link enyo.Scrim#hideAtZIndex} with the same value to hide the
	* scrim.
	*
	* @class  enyo.Scrim
	* @extends enyo.Control
	* @ui
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Scrim.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Scrim',

		/**
		* Current visibility state
		*
		* @type {Boolean}
		* @private
		*/
		showing: false,

		/**
		* @private
		*/
		classes: 'enyo-scrim enyo-fit',

		/**
		* If `true`, the scrim is rendered in a floating layer outside of other
		* controls. This can be used to guarantee that the scrim will be shown
		* on top of other controls.
		*
		* @type {Boolean}
		* @default  false
		* @public
		*/
		floating: false,

		/**
		* @private
		*/
		create: function () {
			this.inherited(arguments);
			this.zStack = [];
			if (this.floating) {
				this.setParent(enyo.floatingLayer);
			}
		},

		/**
		* @private
		*/
		showingChanged: function () {
			// auto render when shown.
			if (this.floating && this.showing && !this.hasNode()) {
				this.render();
			}
			this.inherited(arguments);
			//this.addRemoveClass(this.showingClassName, this.showing);
		},

		/**
		* @private
		*/
		addZIndex: function (zIndex) {
			if (enyo.indexOf(zIndex, this.zStack) < 0) {
				this.zStack.push(zIndex);
			}
		},

		/**
		* @private
		*/
		removeZIndex: function (control) {
			enyo.remove(control, this.zStack);
		},

		/**
		* Shows scrim at the specified z-index. Note that if you call
		* `showAtZIndex()`, you must call [hideAtZIndex()]{@link enyo.Scrim#hideAtZIndex}
		* to properly unwind the z-index stack.
		*
		* @param  {Number} zIndex - z-index for the scrim
		* @public
		*/
		showAtZIndex: function (zIndex) {
			this.addZIndex(zIndex);
			if (zIndex !== undefined) {
				this.setZIndex(zIndex);
			}
			this.show();
		},

		/**
		* Hides scrim at the specified z-index.
		*
		* @param  {Number} zIndex - z-index of the scrim
		* @public
		*/
		hideAtZIndex: function (zIndex) {
			this.removeZIndex(zIndex);
			if (!this.zStack.length) {
				this.hide();
			} else {
				var z = this.zStack[this.zStack.length-1];
				this.setZIndex(z);
			}
		},

		/**
		* @private
		*/
		setZIndex: function (zIndex) {
			this.zIndex = zIndex;
			this.applyStyle('z-index', zIndex);
		},

		/**
		* @private
		*/
		make: function () {
			return this;
		}
	});

	/**
	* Scrim singleton exposing a subset of the Scrim API;
	* it is replaced with a proper {@link enyo.Scrim} instance.
	*
	* @class  enyo.scrimSingleton
	* @private
	*/
	enyo.kind(
		/** @lends  enyo.scrimSingleton.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.scrimSingleton',

		/**
		* @private
		*/
		kind: null,

		/**
		* @private
		*/
		constructor: function (name, props) {
			this.instanceName = name;
			enyo.setPath(this.instanceName, this);
			this.props = props || {};
		},

		/**
		* @private
		*/
		make: function () {
			var s = new enyo.Scrim(this.props);
			enyo.setPath(this.instanceName, s);
			return s;
		},

		/**
		* @private
		*/
		showAtZIndex: function (zIndex) {
			var s = this.make();
			s.showAtZIndex(zIndex);
		},

		/**
		* In case somebody does this out of order
		*
		* @private
		*/
		hideAtZIndex: enyo.nop,

		/**
		* @private
		*/
		show: function () {
			var s = this.make();
			s.show();
		}
	});

	new enyo.scrimSingleton('enyo.scrim', {floating: true, classes: 'enyo-scrim-translucent'});
	new enyo.scrimSingleton('enyo.scrimTransparent', {floating: true, classes: 'enyo-scrim-transparent'});

})(enyo, this);