(function (enyo, scope) {
	/**
	* Fires after the [popup]{@link enyo.Popup} is shown.
	*
	* @event enyo.Popup#event:onShow
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @public
	*/

	/**
	* Fires after the [popup]{@link enyo.Popup} is hidden.
	*
	* @event enyo.Popup#event:onHide
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @public
	*/

	/**
	* _enyo.Popup_ is a [control]{@link enyo.Control} used to display certain content on top of 
	* other content.
	* 
	* [Popups]{@link enyo.Popup} are initially hidden on creation; they can be shown by calling the 
	* [show]{@link enyo.Popup#show} method and re-hidden by calling [hide]{@link enyo.Popup#hide}.  
	* [Popups]{@link enyo.Popup} may be centered using the 
	* [centered]{@link enyo.Popup#centered} property; if not centered, they should be given a 
	* specific position.
	* 
	* A [popup]{@link enyo.Popup} may be optionally floated above all 
	* [application]{@link enyo.Application} content by setting its 
	* [floating]{@link enyo.Popup#floating} property to `true`. This has the advantage of 
	* guaranteeing that the [popup]{@link enyo.Popup} will be displayed on top of other content. 
	* This usage is appropriate when the [popup]{@link enyo.Popup} does not need to scroll along 
	* with other content.
	* 
	* For more information, see the documentation on
	* [Popups](building-apps/controls/popups.html) in the Enyo Developer Guide.
	*
	* @ui
	* @class enyo.Popup
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Popup.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Popup',

		/**
		* @private
		*/
		noDefer: true,

		/**
		* @private
		*/
		classes: 'enyo-popup enyo-no-touch-action',

		/**
		* @private
		*/
		published: 
			/** @lends enyo.Popup.prototype */ {
			
			/**
			* Set to `true` to prevent [controls]{@link enyo.Control} outside the 
			* [popup]{@link enyo.Popup} from receiving [events]{@link external:event} while the 
			* [popup]{@link enyo.Popup} is showing.
			* 
			* @type {Boolean}
			* @default false
			* @public
			*/
			modal: false,

			/**
			* By default, the [popup]{@link enyo.Popup} will hide when the user taps outside it or
			* presses `ESC`.  Set to `false` to prevent this behavior.
			* 
			* @type {Boolean}
			* @default true
			* @public
			*/
			autoDismiss: true,

			/**
			* Set to `true` to render the [popup]{@link enyo.Popup} in a 
			* [floating layer]{@link enyo.FloatingLayer} outside of other 
			* [controls]{@link enyo.Control}.  This can be used to guarantee that the 
			* [popup]{@link enyo.Popup} will be shown on top of other [controls]{@link enyo.Control}.
			* 
			* @type {Boolean}
			* @default false
			* @public
			*/
			floating: false,

			/**
			* Set to `true` to automatically center the [popup]{@link enyo.Popup} in the middle of 
			* the viewport.
			* 
			* @type {Boolean}
			* @default false
			* @public
			*/
			centered: false,

			/**
			* Set to `true` to be able to show transition on the style modifications, otherwise the 
			* transition is invisible (visibility: hidden).
			* 
			* @type {Boolean}
			* @default false
			* @public
			*/
			showTransitions: false,

			/**
			* Set to `true` to stop `preventDefault` from being called on captured 
			* [events]{@link external:event}.
			* 
			* @type {Boolean}
			* @default false
			* @public
			*/
			allowDefault: false
		},
		
		/**
		* @private
		*/
		showing: false,

		/**
		* @private
		*/
		handlers: {
			onkeydown: 'keydown',
			ondragstart: 'dragstart',
			onfocus: 'focus',
			onblur: 'blur',
			onRequestShow: 'requestShow',
			onRequestHide: 'requestHide'
		},

		/**
		* @private
		*/
		captureEvents: true,

		/**
		* @private
		*/
		eventsToCapture: { 
			ondown: 'capturedDown', 
			ontap: 'capturedTap'
		},
		
		/**
		* @private
		*/
		events: {
			onShow: '',
			onHide: ''
		},

		/**
		* @private
		*/
		tools: [
			{kind: 'Signals', onKeydown: 'keydown'}
		],

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function() {
				var showing = this.showing;
				this.showing = false;
				
				sup.apply(this, arguments);
				this.canGenerate = !this.floating;
				
				// if the showing flag was true we know the intent was to automatically show the
				// popup on render...but it can't be rendered in the normal flow...but the rendered
				// method won't be called because it wasn't generated...SO...we arbitrarily flag
				// it as generated even though it wasn't to ensure that its rendered method will
				// be called and we then check for this scenario in rendered
				this.generated = showing;
			};
		}),

		/**
		* @method
		* @private
		*/
		render: enyo.inherit(function (sup) {
			return function() {
				if (this.floating) {
					if (!enyo.floatingLayer.hasNode()) {
						enyo.floatingLayer.render();
					}
					this.parentNode = enyo.floatingLayer.hasNode();
				}
				sup.apply(this, arguments);
			};
		}),

		/**
		* @method
		* @private
		*/
		destroy: enyo.inherit(function (sup) {
			return function() {
				this.release();
				sup.apply(this, arguments);
			};
		}),

		/**
		* @method
		* @private
		*/
		reflow: enyo.inherit(function (sup) {
			return function() {
				this.updatePosition();
				sup.apply(this, arguments);
			};
		}),

		/**
		* @private
		*/
		calcViewportSize: function() {
			if (window.innerWidth) {
				return {
					width: window.innerWidth,
					height: window.innerHeight
				};
			} else {
				var e = document.documentElement;
				return {
					width: e.offsetWidth,
					height: e.offsetHeight
				};
			}
		},

		/**
		* @private
		*/
		updatePosition: function() {
			var d = this.calcViewportSize();
			var b = this.getBounds();

			if (this.targetPosition) {
				// For brevity's sake...
				var p = this.targetPosition;

				// Test and optionally adjust our target bounds (only first is commented, because logic is effectively identical for all scenarios)
				if (typeof p.left === 'number') {
					// If popup will be outside window bounds, switch anchor
					if (p.left + b.width > d.width) {
						if (p.left - b.width >= 0) {
							// Switching to right corner will fit in window
							p.right = d.width - p.left;
						} else {
							// Neither corner will work; stick at side of window
							p.right = 0;
						}
						p.left = null;
					} else {
						p.right = null;
					}
				} else if (typeof p.right === 'number') {
					if (p.right + b.width > d.width) {
						if (p.right - b.width >= 0) {
							p.left = d.width - p.right;
						} else {
							p.left = 0;
						}
						p.right = null;
					} else {
						p.left = null;
					}
				}

				if (typeof p.top === 'number') {
					if (p.top + b.height > d.height) {
						if (p.top - b.height >= 0) {
							p.bottom = d.height - p.top;
						} else {
							p.bottom = 0;
						}
						p.top = null;
					} else {
						p.bottom = null;
					}
				} else if (typeof p.bottom === 'number') {
					if (p.bottom + b.height > d.height) {
						if (p.bottom - b.height >= 0) {
							p.top = d.height - p.bottom;
						} else {
							p.top = 0;
						}
						p.bottom = null;
					} else {
						p.top = null;
					}
				}

				// 'initial' values are necessary to override positioning rules in the CSS
				this.addStyles('left: ' + (p.left !== null ? p.left + 'px' : 'initial') + '; right: ' + (p.right !== null ? p.right + 'px' : 'initial') + '; top: ' + (p.top !== null ? p.top + 'px' : 'initial') + '; bottom: ' + (p.bottom !== null ? p.bottom + 'px' : 'initial') + ';');
			} else if (this.centered) {
				var o = this.getInstanceOwner().getBounds();
				this.addStyles( 'top: ' + Math.max( ( ( o.height - b.height ) / 2 ), 0 ) + 'px; left: ' + Math.max( ( ( o.width - b.width ) / 2 ), 0 ) + 'px;' );
			}
		},

		/**
		* @method
		* @private
		*/
		rendered: enyo.inherit(function (sup) {
			return function () {
				// generated won't be true when this method is called with showing false unless
				// we set it that way so we need to go ahead and do our actual render now that the container (parent)
				// has been rendered and the floating layer can be rendered and we should be able to carry on normally
				if (this.generated && !this.showing && !this.hasNode()) {
					this.generated = false;
					this.showing = true;
					this.showingChanged();
				} else sup.apply(this, arguments);
			};
		}),

		/**
		* @method
		* @fires enyo.Popup#event:onShow
		* @fires enyo.Popup#event:onHide
		* @private
		*/
		showingChanged: enyo.inherit(function (sup) {
			return function() {
				// auto render when shown.
				if (this.floating && this.showing && !this.hasNode()) {
					this.render();
				}
				// hide while sizing, and move to top corner for accurate sizing
				if (this.centered || this.targetPosition) {
					if (!this.showTransitions) {
						this.applyStyle('visibility', 'hidden');
					}
					this.addStyles('top: 0px; left: 0px; right: initial; bottom: initial;');
				}
				sup.apply(this, arguments);
				if (this.showing) {
					this.resize();
					if (this.captureEvents) {
						this.capture();
					}
				} else {
					if (this.captureEvents) {
						this.release();
					}
				}
				// show after sizing
				if (this.centered || this.targetPosition && !this.showTransitions) {
					this.applyStyle('visibility', null);
				}
				// events desired due to programmatic show/hide
				if (this.hasNode()) {
					this[this.showing ? 'doShow' : 'doHide']();
				}
			};
		}),

		/**
		* @private
		*/
		capture: function() {
			enyo.dispatcher.capture(this, this.eventsToCapture);
		},

		/**
		* @private
		*/
		release: function() {
			enyo.dispatcher.release(this);
		},

		/**
		* @private
		*/
		capturedDown: function(sender, e) {
			//record the down event to verify in tap
			this.downEvent = e;

			// prevent focus from shifting outside the popup when modal.
			if (this.modal && !this.allowDefault) {
				e.preventDefault();
			}
			return this.modal;
		},

		/**
		* @private
		*/
		capturedTap: function(sender, e) {
			// dismiss on tap if property is set and click started & ended outside the popup
			if (this.autoDismiss && (!e.dispatchTarget.isDescendantOf(this)) && this.downEvent &&
				(!this.downEvent.dispatchTarget.isDescendantOf(this))) {
				this.downEvent = null;
				this.hide();
			}
			return this.modal;
		},

		/**
		* If a drag event occurs outside a [popup]{@link enyo.Popup}, hide.
		* 
		* @private
		*/
		dragstart: function(sender, e) {
			var inScope = (e.dispatchTarget === this || e.dispatchTarget.isDescendantOf(this));
			if (sender.autoDismiss && !inScope) {
				sender.setShowing(false);
			}
			return true;
		},

		/**
		* @private
		*/
		keydown: function(sender, e) {
			if (this.showing && this.autoDismiss && e.keyCode == 27 /* escape */) {
				this.hide();
			}
		},

		/**
		* If something inside the [popup]{@link enyo.Popup} blurred, keep track of it.
		* 
		* @private
		*/
		blur: function(sender, e) {
			if (e.dispatchTarget.isDescendantOf(this)) {
				this.lastFocus = e.originator;
			}
		},

		/**
		* When something outside the [popup]{@link enyo.Popup} focuses (e.g., due to tab key), focus
		* our last focused [control]{@link enyo.Control}.
		* 
		* @private
		*/
		focus: function(sender, e) {
			var dt = e.dispatchTarget;
			if (this.modal && !dt.isDescendantOf(this)) {
				if (dt.hasNode()) {
					dt.node.blur();
				}
				var n = (this.lastFocus && this.lastFocus.hasNode()) || this.hasNode();
				if (n) {
					n.focus();
				}
			}
		},

		/**
		* @private
		*/
		requestShow: function() {
			this.show();
			return true;
		},

		/**
		* @private
		*/
		requestHide: function() {
			this.hide();
			return true;
		},

		/**
		* Open at the location of a mouse [event]{link external:event}. The 
		* [popup's]{@link enyo.Popup} position is automatically constrained so that it does not
		* display outside the viewport, and defaults to anchoring the top left corner of the 
		* [popup]{@link enyo.Popup} to the mouse [event]{@link external:event}.
		* 
		* @param {Object} e The mouse [event]{@link external:event} that initiated this call.
		* @param {Object} [offset] An optional [object]{@link external:Object} which may contain 
		*	`left` and `top` properties to specify an _offset_ relative to the location the
		*	[popup]{@link enyo.Popup} would otherwise be positioned.
		* @public
		*/
		showAtEvent: function(e, offset) {
			// Calculate our ideal target based on the event position and offset
			var p = {
				left: e.centerX || e.clientX || e.pageX,
				top: e.centerY || e.clientY || e.pageY
			};
			if (offset) {
				p.left += offset.left || 0;
				p.top += offset.top || 0;
			}

			this.showAtPosition(p);
		},

		/**
		* Open the [popup]{@link enyo.Popup} at a specific position. The final location of the 
		* [popup]{@link enyo.Popup} will be automatically constrained so that it does not display 
		* outside the viewport.
		* 
		* @param {Object} pos An [object]{@link external:Object} which may contain left, top, bottom,
		*	and right properties to specify where the [popup]{@link enyo.Popup} will be anchored. If 
		*	both left and right are included, the [popup]{@link enyo.Popup} will have a preference 
		*	of anchoring to the left (likewise, the preference will be for the top if both top and
		*	bottom are specified).
		* @public
		*/
		showAtPosition: function(pos) {
			// Save our target position for later processing
			this.targetPosition = pos;

			// Show the dialog
			this.show();
		}
	});

	/**
	* By default, we capture ondown and ontap to implement the [popup's]{@link enyo.Popup} modal 
	* behavior, but in certain circumstances it may be necessary to capture other 
	* [events]{@link external:event} as well, so we provide this hook to extend. (Currently using 
	* this in Moonstone to capture onSpotlightFocus [events]{@link external:event}).
	* 
	* @private
	*/
	enyo.Popup.concat = function (ctor, props, instance) {
		var proto = ctor.prototype || ctor,
			evts = proto.eventsToCapture;
		proto.eventsToCapture = evts ? enyo.mixin({}, [evts, props.eventsToCapture]) : props.eventsToCapture;
		delete props.eventsToCapture;
	};

})(enyo, this);

