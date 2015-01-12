(function (enyo, scope) {
	/**
	* Fires after the [popup]{@link enyo.Popup} is shown.
	*
	* @event enyo.Popup#onShow
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires after the [popup]{@link enyo.Popup} is hidden.
	*
	* @event enyo.Popup#onHide
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* {@link enyo.Popup} is a [control]{@link enyo.Control} used to display certain content
	* on top of other content.
	*
	* Popups are initially hidden on creation; they may be shown by calling the
	* [show()]{@link enyo.Control#show} method and re-hidden by calling
	* [hide()]{@link enyo.Control#hide}. Popups may be centered using the
	* [centered]{@link enyo.Popup#centered} property; if not centered, they should
	* be given a specific position.
	*
	* A popup may be optionally floated above all
	* [application]{@link enyo.Application} content by setting its
	* [floating]{@link enyo.Popup#floating} property to `true`. This has the
	* advantage of guaranteeing that the popup will be displayed on top of other
	* content. This usage is appropriate when the popup does not need to scroll
	* along with other content.
	*
	* To avoid obscuring popup contents, scrims require the dialog to be floating;
	* otherwise, they won't render. A modal popup will get a transparent scrim
	* unless the popup isn't floating. To get a translucent scrim when modal,
	* specify `[scrim]{@link enyo.Popup#scrim}: true` and
	* `[scrimWhenModal]{@link enyo.Popup#scrimWhenModal}: false`.
	*
	* Finally, there is a WebKit bug affecting the behavior of popups that are
	* displayed on top of text input controls.  For more information, including a
	* workaround, see the documentation on
	* [Popups]{@linkplain $dev-guide/building-apps/controls/popups.html}
	* in the Enyo Developer Guide.
	*
	* @class enyo.Popup
	* @extends enyo.Control
	* @ui
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
		kind: 'enyo.Control',

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
			* [popup]{@link enyo.Popup} from receiving [events]{@glossary event} while the
			* popup is showing.
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
			* [controls]{@link enyo.Control}.  This may be used to guarantee that the
			* popup will be shown on top of other controls.
			*
			* @type {Boolean}
			* @default false
			* @public
			*/
			floating: false,

			/**
			* Set to `true` to automatically center the [popup]{@link enyo.Popup} in
			* the middle of the viewport.
			*
			* @type {Boolean}
			* @default false
			* @public
			*/
			centered: false,

			/**
			* Set to `true` to be able to show transition on the style modifications;
			* otherwise the transition is invisible `(visibility: hidden)`.
			*
			* @type {Boolean}
			* @default false
			* @public
			*/
			showTransitions: false,

			/**
			* Set to `true` to stop `preventDefault()` from being called on captured
			* [events]{@glossary event}.
			*
			* @type {Boolean}
			* @default false
			* @public
			*/
			allowDefault: false,

			/**
			* Boolean that controls whether a scrim will appear when the dialog is
			* modal. Note that modal scrims are transparent, so you won't see them.
			*
			* @type {Boolean}
			* @default true
			* @public
			*/
			scrimWhenModal: true,

			/**
			* Boolean that controls whether or not a scrim will be displayed. Scrims are
			* only displayed when the dialog is floating.
			*
			* @type {Boolean}
			* @default  false
			* @public
			*/
			scrim: false,

			/**
			* Optional class name to apply to the scrim. Be aware that the scrim
			* is a singleton and you will be modifying the scrim instance used for
			* other popups.
			*
			* @type {String}
			* @default  ''
			* @public
			*/
			scrimClassName: '',

			/**
			* Lowest z-index that may be applied to a popup
			*
			* @type {Number}
			* @default  120
			* @public
			*/
			defaultZ: 120
		},

		/**
		* @lends  enyo.Popup
		* @private
		*/
		protectedStatics: {
			/**
			* Count of currently showing popups
			* @type {Number}
			* @static
			* @private
			*/
			count: 0,

			/**
			* Highest possible z-index for a popup
			* @type {Number}
			* @static
			* @private
			*/
			highestZ: 120
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
		teardownRender: enyo.inherit(function (sup) {
			return function () {
				// if this is a rendered floating popup, remove the node from the
				// floating layer because it won't be removed otherwise
				var node = this.hasNode();
				if(this.floating && node) {
					this.node.remove();
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
		calcViewportSize: function () {
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
		updatePosition: function () {
			var d = this.calcViewportSize(),
				b = this.getBounds();

			if (this.targetPosition) {
				// For brevity's sake...
				var p = this.targetPosition;

				// Test and optionally adjust our target bounds (only first is commented, because logic is effectively identical for all scenarios)
				if (typeof p.left == 'number') {
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
				} else if (typeof p.right == 'number') {
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

				if (typeof p.top == 'number') {
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
				} else if (typeof p.bottom == 'number') {
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
				var o = this.floating ? d : this.getInstanceOwner().getBounds();
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
		* @fires enyo.Popup#onShow
		* @fires enyo.Popup#onHide
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
					enyo.Popup.count++;
					this.applyZIndex();
					if (this.captureEvents) {
						this.capture();
					}
				} else {
					if(enyo.Popup.count > 0) {
						enyo.Popup.count--;
					}
					if (this.captureEvents) {
						this.release();
					}
				}
				this.showHideScrim(this.showing);
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
		capture: function () {
			enyo.dispatcher.capture(this, this.eventsToCapture);
		},

		/**
		* @private
		*/
		release: function () {
			enyo.dispatcher.release(this);
		},

		/**
		* @private
		*/
		capturedDown: function (sender, e) {
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
		capturedTap: function (sender, e) {
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
		dragstart: function (sender, e) {
			var inScope = (e.dispatchTarget === this || e.dispatchTarget.isDescendantOf(this));
			if (sender.autoDismiss && !inScope) {
				sender.setShowing(false);
			}
			return true;
		},

		/**
		* @private
		*/
		keydown: function (sender, e) {
			if (this.showing && this.autoDismiss && e.keyCode == 27 /* escape */) {
				this.hide();
			}
		},

		/**
		* If something inside the [popup]{@link enyo.Popup} blurred, keep track of it.
		*
		* @private
		*/
		blur: function (sender, e) {
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
		focus: function (sender, e) {
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
		requestShow: function () {
			this.show();
			return true;
		},

		/**
		* @private
		*/
		requestHide: function () {
			this.hide();
			return true;
		},

		/**
		* Opens the [popup]{@link enyo.Popup} at the location of a mouse
		* {@glossary event}. The popup's position is automatically constrained so
		* that it does not display outside the viewport, and defaults to anchoring
		* the top left corner of the popup to the position of the mouse event.
		*
		* @param {Object} e - The mouse {@glossary event} that initiated this call.
		* @param {Object} [offset] - An optional [object]{@glossary Object} that may
		* contain `left` and `top` properties to specify an offset relative to the
		* location where the [popup]{@link enyo.Popup} would otherwise be positioned.
		* @public
		*/
		showAtEvent: function (e, offset) {
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
		* Opens the [popup]{@link enyo.Popup} at a specific position. The final
		* location of the popup will be automatically constrained so that it does
		* not display outside the viewport.
		*
		* @param {Object} pos An [object]{@glossary Object} that may contain `left`,
		* `top`, `bottom`, and `right` properties to specify where the
		* [popup]{@link enyo.Popup} will be anchored. If both `left` and `right` are
		* included, the preference will be to anchor on the left; similarly, if both
		* `top` and `bottom` are specified, the preference will be to anchor at the
		* top.
		* @public
		*/
		showAtPosition: function (pos) {
			// Save our target position for later processing
			this.targetPosition = pos;

			// Show the dialog
			this.show();
		},

		/**
		* Toggles the display of the scrim
		*
		* @param  {Boolean} show - Show the scrim
		* @private
		*/
		showHideScrim: function (show) {
			if (this.floating && (this.scrim || (this.modal && this.scrimWhenModal))) {
				var scrim = this.getScrim();
				if (show) {
					// move scrim to just under the popup to obscure rest of screen
					var i = this.getScrimZIndex();
					this._scrimZ = i;
					scrim.showAtZIndex(i);
				} else {
					scrim.hideAtZIndex(this._scrimZ);
				}
				enyo.call(scrim, 'addRemoveClass', [this.scrimClassName, scrim.showing]);
			}
		},

		/**
		* Calculates the z-index for the scrim so it's directly below the popup
		*
		* @private
		*/
		getScrimZIndex: function () {
			return enyo.Popup.highestZ >= this._zIndex ? this._zIndex - 1 : enyo.Popup.highestZ;
		},

		/**
		* Show a transparent scrim for modal popups if {@link enyo.Popup#scrimWhenModal} is `true`
		* if {@link enyo.Popup#scrim} is `true`, then show a regular scrim.
		*
		* @return {enyo.Scrim}
		* @private
		*/
		getScrim: function () {
			//
			if (this.modal && this.scrimWhenModal && !this.scrim) {
				return enyo.scrimTransparent.make();
			}
			return enyo.scrim.make();
		},

		/**
		* Adjust the zIndex so that popups will properly stack on each other.
		*
		* @private
		*/
		applyZIndex: function () {
			this._zIndex = (enyo.Popup.count * 2) + this.findZIndex() + 1;
			if (this._zIndex <= enyo.Popup.highestZ) {
				this._zIndex = enyo.Popup.highestZ + 1;
			}
			if (this._zIndex > enyo.Popup.highestZ) {
				enyo.Popup.highestZ = this._zIndex;
			}
			// leave room for scrim
			this.applyStyle('z-index', this._zIndex);
		},

		/**
		* Find the z-index for this popup, clamped by {@link enyo.Popup#defaultZ}
		*
		* @return {Number} z-index value
		* @private
		*/
		findZIndex: function () {
			// a default z value
			var z = this.defaultZ;
			if (this._zIndex) {
				z = this._zIndex;
			} else if (this.hasNode()) {
				// Re-use existing zIndex if it has one
				z = Number(enyo.dom.getComputedStyleValue(this.node, 'z-index')) || z;
			}
			if (z < this.defaultZ) {
				z = this.defaultZ;
			}
			this._zIndex = z;
			return this._zIndex;
		}
	});

	/**
	* By default, we capture `ondown` and `ontap` to implement the [popup's]{@link enyo.Popup}
	* modal behavior, but in certain circumstances it may be necessary to capture other
	* [events]{@glossary event} as well, so we provide this hook to extend. (We are currently
	* using this in Moonstone to capture `onSpotlightFocus` [events]{@glossary event}).
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

