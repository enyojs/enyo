(function (enyo, scope) {

	/**
	* Enyo supports a set of normalized events that work similarly across all supported platforms.
	* These events are provided so that users can write a single set of event handlers for
	* applications that run on both mobile and desktop platforms. They are needed because desktop
	* and mobile platforms handle basic input differently.
	*
	* For more information on normalized input events and their associated properties, see the
	* documentation on [User Input]{@link building-apps/user-input.html} in the Enyo Developer Guide.
	*
	* @namespace enyo.gesture
	* @public
	*/
	enyo.gesture =
		/** @lends enyo.gesture */ {

		/**
		* @private
		*/
		eventProps: ['target', 'relatedTarget', 'clientX', 'clientY', 'pageX', 'pageY',
			'screenX', 'screenY', 'altKey', 'ctrlKey', 'metaKey', 'shiftKey',
			'detail', 'identifier', 'dispatchTarget', 'which', 'srcEvent'],

		/**
		* @public
		*/
		defaultDoubleTapInterval: 400,

		/**
		* Creates an {@glossary event} of type `type` and returns it.
		* `evt` should be an event [object]{@glossary Object}.
		*
		* @param {String} type - The type of {@glossary event} to make.
		* @param {(Event|Object)} evt - The event you'd like to clone or an object that looks like it.
		* @returns {Object} The new event [object]{@glossary Object}.
		* @public
		*/
		makeEvent: function(type, evt) {
			var e = {};
			e.type = type;
			for (var i=0, p; (p=this.eventProps[i]); i++) {
				e[p] = evt[p];
			}
			e.srcEvent = e.srcEvent || evt;
			e.preventDefault = this.preventDefault;
			e.disablePrevention = this.disablePrevention;

			if (enyo.dom._bodyScaleFactorX !== 1 || enyo.dom._bodyScaleFactorY !== 1) {
				// Intercept only these events, not all events, like: hold, release, tap, etc,
				// to avoid doing the operation again.
				if (e.type == 'move' || e.type == 'up' || e.type == 'down' || e.type == 'enter' || e.type == 'leave') {
					e.clientX *= enyo.dom._bodyScaleFactorX;
					e.clientY *= enyo.dom._bodyScaleFactorY;
				}
			}
			//
			// normalize event.which and event.pageX/event.pageY
			// Note that while 'which' works in IE9, it is broken for mousemove. Therefore,
			// in IE, use window.event.button
			if (enyo.platform.ie < 10) {
				//Fix for IE8, which doesn't include pageX and pageY properties
				if(enyo.platform.ie==8 && e.target) {
					e.pageX = e.clientX + e.target.scrollLeft;
					e.pageY = e.clientY + e.target.scrollTop;
				}
				var b = window.event && window.event.button;
				if (b) {
					// multi-button not supported, priority: left, right, middle
					// (note: IE bitmask is 1=left, 2=right, 4=center);
					e.which = b & 1 ? 1 : (b & 2 ? 2 : (b & 4 ? 3 : 0));
				}
			} else if (enyo.platform.webos || window.PalmSystem) {
				// Temporary fix for owos: it does not currently supply 'which' on move events
				// and the user agent string doesn't identify itself so we test for PalmSystem
				if (e.which === 0) {
					e.which = 1;
				}
			}
			return e;
		},

		/**
		* Handles "down" [events]{@glossary event}, including `mousedown` and `keydown`. This is
		* responsible for the press-and-hold key repeater.
		*
		* @param {Event} evt - The standard {@glossary event} [object]{glossary Object}.
		* @public
		*/
		down: function(evt) {
			// set holdpulse defaults
			this.drag.holdPulseConfig = enyo.clone(this.drag.holdPulseDefaultConfig);

			// cancel any hold since it's possible in corner cases to get a down without an up
			var e = this.makeEvent('down', evt);

			// expose method for configuring holdpulse options
			e.configureHoldPulse = this.configureHoldPulse;

			enyo.dispatch(e);
			this.downEvent = e;

			// workaround to allow event to propagate to control before hold job begins
			this.drag.cancelHold();
			this.drag.beginHold(e);
		},

		/**
		* Handles `mousemove` [events]{@glossary event}.
		*
		* @param {Event} evt - The standard {@glossary event} [object]{glossary Object}.
		* @public
		*/
		move: function(evt) {
			var e = this.makeEvent('move', evt);
			// include delta and direction v. down info in move event
			e.dx = e.dy = e.horizontal = e.vertical = 0;
			if (e.which && this.downEvent) {
				e.dx = evt.clientX - this.downEvent.clientX;
				e.dy = evt.clientY - this.downEvent.clientY;
				e.horizontal = Math.abs(e.dx) > Math.abs(e.dy);
				e.vertical = !e.horizontal;
			}
			enyo.dispatch(e);
		},

		/**
		* Handles "up" [events]{@glossary event}, including `mouseup` and `keyup`.
		*
		* @param {Event} evt - The standard {@glossary event} [object]{glossary Object}.
		* @public
		*/
		up: function(evt) {
			var e = this.makeEvent('up', evt);
			var tapPrevented = false;
			e.preventTap = function() {
				tapPrevented = true;
			};
			enyo.dispatch(e);
			if (!tapPrevented && this.downEvent && this.downEvent.which == 1) {
				this.sendTap(e);
			}
			this.downEvent = null;
		},

		/**
		* Handles `mouseover` [events]{@glossary event}.
		*
		* @param {Event} evt - The standard {@glossary event} [object]{glossary Object}.
		* @public
		*/
		over: function(evt) {
			var e = this.makeEvent('enter', evt);
			enyo.dispatch(e);
		},

		/**
		* Handles `mouseout` [events]{@glossary event}.
		*
		* @param {Event} evt - The standard {@glossary event} [object]{glossary Object}.
		* @public
		*/
		out: function(evt) {
			var e = this.makeEvent('leave', evt);
			enyo.dispatch(e);
		},

		/**
		* Generates `tap` [events]{@glossary event}.
		*
		* @param {Event} evt - The standard {@glossary event} [object]{glossary Object}.
		* @public
		*/
		sendTap: function(evt) {
			// The common ancestor for the down/up pair is the origin for the tap event
			var t = this.findCommonAncestor(this.downEvent.target, evt.target);
			if (t && !this.doubleTap(evt, t)) {
				var e = this.makeEvent('tap', evt);
				e.target = t;
				enyo.dispatch(e);
			}
		},

		/**
		* private
		*/
		tapData: {},

		/**
		* private
		*/
		doubleTap: function(evt, t) {

			var obj = enyo.dispatcher.findDispatchTarget(t);
			if (!obj || !obj.doubleTapEnabled) {
				return false;
			}

			var data = this.tapData[obj.name];
			if (!data) {
				data = {name: obj.name, lastTapTimestamp: null, waitingForSecondTap: false};
				this.tapData[obj.name] = data;
			}

			var tapTimeToWait = obj.doubleTapInterval || this.defaultDoubleTapInterval; 
			var tempTimestamp = data.lastTapTimestamp, tempTarget = this.lastTapTarget;
			data.lastTapTimestamp = enyo.perfNow();
			this.lastTapTarget = t;

			if (t !== tempTarget || !data.waitingForSecondTap) {
				data.waitingForSecondTap = true;
				setTimeout(enyo.bind(this, 'waitTapTimeout', {evt: evt, t: t, data: data}), tapTimeToWait);
				return true;
			}

			data.waitingForSecondTap = false;
			var tapInterval = data.lastTapTimestamp - tempTimestamp;

			if (tapInterval <= tapTimeToWait) {
				var e2 = this.makeEvent('doubletap', evt);
				e2.target = t;
				e2.tapInterval = tapInterval;
				enyo.dispatch(e2);
			}

			delete this.tapData[obj.name];

			return true;
		},

		/**
		* @private
		*/
		waitTapTimeout: function(ctx) {
			if (ctx.data && ctx.data.waitingForSecondTap) {
				ctx.data.waitingForSecondTap = false;
				var e = this.makeEvent('tap', ctx.evt);
				e.target = ctx.t;
				enyo.dispatch(e);
				delete this.tapData[ctx.data.name];
			}
		},

		/**
		* Given two [DOM nodes]{@glossary Node}, searches for a shared ancestor (looks up
		* the hierarchic [DOM]{@glossary DOM} tree of [nodes]{@glossary Node}). The shared
		* ancestor node is returned.
		*
		* @param {Node} controlA - Control one.
		* @param {Node} controlB - Control two.
		* @returns {(Node|undefined)} The shared ancestor.
		* @public
		*/
		findCommonAncestor: function(controlA, controlB) {
			var p = controlB;
			while (p) {
				if (this.isTargetDescendantOf(controlA, p)) {
					return p;
				}
				p = p.parentNode;
			}
		},

		/**
		* Given two controls, returns `true` if the `child` is inside the `parent`.
		*
		* @param {Node} child - The child to search for.
		* @param {Node} parent - The expected parent.
		* @returns {(Boolean|undefined)} `true` if the `child` is actually a child of `parent`.
		*/
		isTargetDescendantOf: function(child, parent) {
			var c = child;
			while(c) {
				if (c == parent) {
					return true;
				}
				c = c.parentNode;
			}
		},

		/**
		* Assigns {@link enyo.gesture.drag.holdPulseConfig} to {@link enyo.gesture}.
		*
		* @public
		*/
		configureHoldPulse: function(opts) {
			enyo.mixin(enyo.gesture.drag.holdPulseConfig, opts);
		}
	};

	/**
	* Installed on [events]{@glossary event} and called in event context.
	*
	* @private
	*/
	enyo.gesture.preventDefault = function() {
		if (this.srcEvent) {
			this.srcEvent.preventDefault();
		}
	};

	/**
	* @private
	*/
	enyo.gesture.disablePrevention = function() {
		this.preventDefault = enyo.nop;
		if (this.srcEvent) {
			this.srcEvent.preventDefault = enyo.nop;
		}
	};

	enyo.dispatcher.features.push(
		function(e) {
			// NOTE: beware of properties in enyo.gesture inadvertently mapped to event types
			if (enyo.gesture.events[e.type]) {
				return enyo.gesture.events[e.type](e);
			}
		}
	);

	/**
	* @namespace enyo.gesture.events
	* @public
	*/
	enyo.gesture.events =
		/** @lends enyo.gesture.events */ {

		/**
		* Shortcut to [enyo.gesture.down()]{@link enyo.gesture.down}.
		*
		* @public
		*/
		mousedown: function(e) {
			enyo.gesture.down(e);
		},

		/**
		* Shortcut to [enyo.gesture.up()]{@link enyo.gesture.up}.
		*
		* @public
		*/
		mouseup: function(e) {
			enyo.gesture.up(e);
		},

		/**
		* Shortcut to [enyo.gesture.move()]{@link enyo.gesture.move}.
		*
		* @public
		*/
		mousemove:  function(e) {
			enyo.gesture.move(e);
		},

		/**
		* Shortcut to [enyo.gesture.over()]{@link enyo.gesture.over}.
		*
		* @public
		*/
		mouseover:  function(e) {
			enyo.gesture.over(e);
		},

		/**
		* Shortcut to [enyo.gesture.out()]{@link enyo.gesture.out}.
		*
		* @public
		*/
		mouseout:  function(e) {
			enyo.gesture.out(e);
		}
	};

	// Firefox mousewheel handling
	enyo.requiresWindow(function() {
		if (document.addEventListener) {
			document.addEventListener('DOMMouseScroll', function(inEvent) {
				var e = enyo.clone(inEvent);
				e.preventDefault = function() {
					inEvent.preventDefault();
				};
				e.type = 'mousewheel';
				var p = e.VERTICAL_AXIS == e.axis ? 'wheelDeltaY' : 'wheelDeltaX';
				e[p] =  e.detail * -40;
				enyo.dispatch(e);
			}, false);
		}
	});

})(enyo, this);