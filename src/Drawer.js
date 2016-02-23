require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Drawer~Drawer} kind.
* @module enyo/Drawer
*/

var
	kind = require('./kind');

var
	Animator = require('enyo/Animator'),
	Control = require('./Control');

/**
* Fires when the [drawer]{@link module:enyo/Drawer~Drawer} has been opened or closed. The handler can
* determine whether the drawer was just opened or just closed based on the
* [open]{@link module:enyo/Drawer~Drawer#open} property. If `this.getOpen()` returns `true`,
* the drawer was opened; if not, it was closed.
*
* @event module:enyo/Drawer~Drawer#onDrawerAnimationStep
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when the [drawer]{@link module:enyo/Drawer~Drawer} has been opened or closed. The handler
* can determine whether the drawer was just opened or just closed based on the
* [open]{@link module:enyo/Drawer~Drawer#open} property. If `this.getOpen()` returns `true`,
* the drawer was opened; if not, it was closed.
*
* @event module:enyo/Drawer~Drawer#onDrawerAnimationEnd
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* {@link module:enyo/Drawer~Drawer} is a control that appears or disappears based on its
* [open]{@link module:enyo/Drawer~Drawer#open} property. By default, the drawer appears
* or disappears with a sliding animation whose direction is determined by the
* [orient]{@link module:enyo/Drawer~Drawer#orient} property.
*
* For more information, see the documentation on
* [Drawers]{@linkplain $dev-guide/building-apps/layout/drawers.html} in the
* Enyo Developer Guide.
*
* @class Drawer
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:enyo/Drawer~Drawer.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.Drawer',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	published:
		/** @lends module:enyo/Drawer~Drawer.prototype */ {

		/**
		* The visibility state of the [drawer's]{@link module:enyo/Drawer~Drawer} associated control.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		open : true,

		/**
		* The direction of the opening/closing animation; will be either `'v'` for vertical
		* or `'h'` for horizontal.
		*
		* @type {String}
		* @default 'v'
		* @public
		*/
		orient : 'v',

		/**
		* If `true`, the opening/closing transition will be animated.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		animated : true,

		/**
		* If `true`, the [drawer]{@link module:enyo/Drawer~Drawer} will resize its container as it is
		* animating, which is useful when the drawer is placed inside a
		* [FittableLayout]{@link module:layout/FittableLayout~FittableLayout}.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		resizeContainer: true
	},

	/**
	* @private
	*/
	events: {
		onDrawerAnimationStep: '',
		onDrawerAnimationEnd: ''
	},

	/**
	* @private
	*/
	style: 'overflow: hidden; position: relative;',

	/**
	* @private
	*/
	tools: [
		{kind: Animator, onStep: 'animatorStep', onEnd: 'animatorEnd'},
		{name: 'client', style: 'position: relative;', classes: 'enyo-border-box'}
	],

	/**
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.animatedChanged();
			this.openChanged();
		};
	}),

	/**
	* @method
	* @private
	*/
	initComponents: kind.inherit(function (sup) {
		return function() {
			this.createChrome(this.tools);
			sup.apply(this, arguments);
		};
	}),

	/**
	* @private
	*/
	teardownRender: kind.inherit(function (sup) {
		return function (caching) {
			if (caching) this.$.animator.complete();
			sup.apply(this, arguments);
		};
	}),

	/**
	* @private
	*/
	animatedChanged: function () {
		if (!this.animated && this.hasNode() && this.$.animator.isAnimating()) {
			this.$.animator.stop();
			this.animatorEnd();
		}
	},

	/**
	* @private
	*/
	openChanged: function () {
		this.$.client.show();
		if (this.hasNode()) {
			if (this.$.animator.isAnimating()) {
				this.$.animator.reverse();
			} else {
				var v = this.orient == 'v';
				var d = v ? 'height' : 'width';
				var p = v ? 'top' : 'left';
				// unfixing the height/width is needed to properly
				// measure the scrollHeight/Width DOM property, but
				// can cause a momentary flash of content on some browsers
				this.applyStyle(d, null);
				var s = this.hasNode()[v ? 'scrollHeight' : 'scrollWidth'];
				if (this.animated) {
					this.$.animator.play({
						startValue: this.open ? 0 : s,
						endValue: this.open ? s : 0,
						dimension: d,
						position: p
					});
				} else {
					// directly run last frame if not animating
					this.animatorEnd();
				}
			}
		} else {
			this.$.client.setShowing(this.open);
		}
	},

	/**
	* @private
	*/
	animatorStep: function (sender) {
		// the actual drawer DOM node adjusts its height
		if (this.hasNode()) {
			var d = sender.dimension;
			this.applyStyle(d, sender.value + 'px');
		}
		// while the client inside the drawer adjusts its position to move out of the visible area
		var cn = this.$.client.hasNode();
		if (cn) {
			var p = sender.position;
			var o = (this.open ? sender.endValue : sender.startValue);
			this.$.client.applyStyle(p, (sender.value - o) + 'px');
		}
		if (this.container && this.resizeContainer) {
			this.container.resize();
		}
		this.doDrawerAnimationStep();
		return true;
	},

	/**
	* @private
	*/
	animatorEnd: function () {
		if (!this.open) {
			this.$.client.hide();
		}
		else {
			var v = (this.orient == 'v');
			var d = v ? 'height' : 'width';
			var p = v ? 'top' : 'left';
			var cn = this.$.client.hasNode();
			// clear out changes to container position & node dimension
			if (cn) {
				this.$.client.applyStyle(p, null);
			}
			if (this.node) {
				this.applyStyle(d, null);
			}
		}
		if (this.container && this.resizeContainer) {
			this.container.resize();
		}
		this.doDrawerAnimationEnd();
		return true;
	}
});
