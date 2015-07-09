/**
* Exports the {@link module:enyo/floatingLayer~FloatingLayer} singleton instance.
* @module enyo/floatingLayer
*/

require('enyo');

var
	dispatcher = require('./dispatcher'),
	kind = require('./kind'),
	platform = require('./platform');

module.exports = function (Control) {
	/**
	* {@link module:enyo/floatingLayer~FloatingLayer} is a [control]{@link module:enyo/Control~Control} that provides a layer for
	* controls that should be displayed above an [application]{@link module:enyo/Application~Application}. The
	* `floatingLayer` singleton can be set as a control's parent to have the control float
	* above the application, e.g.:
	*
	* ```
	* var floatingLayer = require('enyo/floatingLayer');
	* ...
	* create: kind.inherit(function (sup) {
	*	return function() {
	*		sup.apply(this, arguments);
	*		this.setParent(floatingLayer);
	*	}
	* });
	* ```
	*
	* Note: `FloatingLayer` is not meant to be instantiated by users.
	*
	* @class FloatingLayer
	* @extends module:enyo/Control~Control
	* @ui
	* @protected
	*/
	return kind(
		/** @lends module:enyo/floatingLayer~FloatingLayer.prototype */ {

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
		rendered: kind.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				this.preventScroll();
			};
		}),

		/**
		* Implemented primarily to prevent browser-initiated scrolling controls within the floating
		* layer into view when those controls are explicitly focus()'ed
		*
		* @private
		*/
		preventScroll: function () {
			var node = this.hasNode();
			if (node) {
				dispatcher.listen(node, 'scroll', function () {
					node.scrollTop = 0;
				});
			}
		},

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
