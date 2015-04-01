(function (enyo, scope) {
	/**
	* {@link enyo.FloatingLayer} is a [control]{@link enyo.Control} that provides a layer for
	* controls that should be displayed above an [application]{@link enyo.Application}. The
	* `floatingLayer` singleton can be set as a control's parent to have the control float
	* above the application, e.g.:
	*
	* ```
	* create: enyo.inherit(function (sup) {
	*	return function() {
	*		sup.apply(this, arguments);
	*		this.setParent(enyo.floatingLayer);
	*	}
	* });
	* ```
	*
	* Note: `enyo.FloatingLayer` is not meant to be instantiated by users.
	*
	* @class enyo.FloatingLayer
	* @extends enyo.Control
	* @ui
	* @protected
	*/
	enyo.kind(
		/** @lends enyo.FloatingLayer.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.FloatingLayer',

		/**
		* @private
		*/
		kind: 'enyo.Control',

		/**
		* @private
		*/
		classes: 'enyo-fit enyo-clip enyo-untouchable',

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				this.setParent(null);

				if (enyo.platform.ie < 11) {
					this.removeClass('enyo-fit');
				}
			};
		}),

		/**
		* Detects when [node]{@glossary Node} is detatched due to `document.body` being stomped.
		*
		* @method
		* @private
		*/
		hasNode: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				if (this.node && !this.node.parentNode) {
					this.teardownRender();
				}
				return this.node;
			};
		}),

		/**
		* @method
		* @private
		*/
		render: enyo.inherit(function (sup) {
			return function() {
				this.parentNode = document.body;
				return sup.apply(this, arguments);
			};
		}),

		/**
		* @private
		*/
		generateInnerHtml: function () {
			return '';
		},

		/**
		* @private
		*/
		beforeChildRender: function () {
			if (!this.hasNode()) {
				this.render();
			}
		},

		/**
		* @private
		*/
		teardownChildren: function () {
		}
	});

	enyo.floatingLayer = new enyo.FloatingLayer();

})(enyo, this);