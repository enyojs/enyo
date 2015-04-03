require('enyo');

var
	kind = require('./kind'),
	utils = require('./utils'),
	platform = require('./platform');

module.exports = function (Control) {
	/**
	* {@link enyo.FloatingLayer} is a [control]{@link enyo.Control} that provides a layer for
	* controls that should be displayed above an [application]{@link enyo.Application}. The
	* `floatingLayer` singleton can be set as a control's parent to have the control float
	* above the application, e.g.:
	*
	* ```
	* create: kind.inherit(function (sup) {
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
	return kind(
		/** @lends enyo.FloatingLayer.prototype */ {

		/**
		* @private
		*/
		kind: Control,

		/**
		* @private
		*/
		classes: 'enyo-fit enyo-clip enyo-untouchable',

		/**
		* @method
		* @private
		*/
		create: kind.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				this.setParent(null);

				if (platform.ie < 11) {
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
		hasNode: kind.inherit(function (sup) {
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
		render: kind.inherit(function (sup) {
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
};