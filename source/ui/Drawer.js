(function (enyo, scope) {
	/**
	* Fires when the [drawer]{@link enyo.Drawer} has been opened or closed. The handler can 
	* determine whether the [drawer]{@link enyo.Drawer} was just opened or just closed based
	* on the [open]{@link enyo.Drawer#open} property. If `this.getOpen()` returns `true`, 
	* the [drawer]{@link enyo.Drawer} was opened; if not, it was closed.
	*
	* @event enyo.Drawer#event:onDrawerAnimationStep
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @public
	*/

	/**
	* Fires when the [drawer]{@link enyo.Drawer} has been opened or closed. The handler can 
	* determine whether the [drawer]{@link enyo.Drawer} was just opened or just closed based
	* on the [open]{@link enyo.Drawer#open} property. If `this.getOpen()` returns `true`, 
	* the [drawer]{@link enyo.Drawer} was opened; if not, it was closed.
	*
	* @event enyo.Drawer#event:onDrawerAnimationEnd
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @public
	*/

	/**
	* _enyo.Drawer_ is a control that appears or disappears based on its 
	* [open]{@link enyo.Drawer#open} property. By default, the [drawer]{@link enyo.Drawer} appears 
	* or disappears with a sliding animation whose direction is determined by the 
	* [orient]{@link enyo.Drawer#orient} property.
	*
	* For more information, see the documentation on
	* [Drawers](building-apps/layout/drawers.html) in the Enyo Developer Guide.
	*
	* @ui
	* @class enyo.Drawer
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Drawer.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Drawer',

		/**
		* @private
		*/
		published: 
			/** @lends enyo.Drawer.prototype */ {
			
			/**
			* The visibility state of the [drawer's]{@link enyo.Drawer} associated control.
			* 
			* @type {Boolean}
			* @default true
			* @public
			*/
			open : true,

			/**
			* Direction of the opening/closing animation--either 'v' for vertical or 'h' for 
			* horizontal.
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
			* If `true`, {@link enyo.Drawer} will resize its container as it is animating, which is 
			* useful when placed inside of a [FittableLayout]{@link enyo.FittableLayout}.
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
			{kind: 'Animator', onStep: 'animatorStep', onEnd: 'animatorEnd'},
			{name: 'client', style: 'position: relative;', classes: 'enyo-border-box'}
		],

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
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
		initComponents: enyo.inherit(function (sup) {
			return function() {
				this.createChrome(this.tools);
				sup.apply(this, arguments);
			};
		}),

		/**
		* @private
		*/
		animatedChanged: function() {
			if (!this.animated && this.hasNode() && this.$.animator.isAnimating()) {
				this.$.animator.stop();
				this.animatorEnd();
			}
		},

		/**
		* @private
		*/
		openChanged: function() {
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
		animatorStep: function(inSender) {
			// the actual drawer DOM node adjusts its height
			if (this.hasNode()) {
				var d = inSender.dimension;
				this.applyStyle(d, inSender.value + 'px');
			}
			// while the client inside the drawer adjusts its position to move out of the visible area
			var cn = this.$.client.hasNode();
			if (cn) {
				var p = inSender.position;
				var o = (this.open ? inSender.endValue : inSender.startValue);
				this.$.client.applyStyle(p, (inSender.value - o) + 'px');
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
		animatorEnd: function() {
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

})(enyo, this);
