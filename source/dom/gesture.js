(function (enyo, scope) {

	/**
	* Enyo supports a set of normalized events that work similarly across all supported platforms.
	* These events are provided so that users can write a single set of event handlers for
	* applications that run on both mobile and desktop platforms. They are needed because desktop
	* and mobile platforms handle basic input differently.
	*
	* For more information on normalized input events and their associated properties, see the
	* documentation on [Event Handling]{@linkplain $dev-guide/key-concepts/event-handling.html}
	* in the Enyo Developer Guide.
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
			var e = this.makeEvent('down', evt);

			// prepare for hold
			this.drag.prepareHold(e);

			// enable prevention of tap event
			e.preventTap = function() {
				e._tapPrevented = true;
			};

			enyo.dispatch(e);
			this.downEvent = e;

			// start hold, now that control has had a chance
			// to override the holdPulse configuration
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

			// We have added some logic to synchronize up and down events in certain scenarios (i.e.
			// clicking multiple buttons with a mouse) and to generally guard against any potential
			// asymmetry, but a full solution would be to maintain a map of up/down events as an 
			// ideal solution, for future work.
			e._tapPrevented = this.downEvent && this.downEvent._tapPrevented && this.downEvent.which == e.which;
			e.preventTap = function() {
				e._tapPrevented = true;
			};

			enyo.dispatch(e);
			if (!e._tapPrevented && this.downEvent && this.downEvent.which == 1) {
				var target = this.findCommonAncestor(this.downEvent.target, evt.target);

				// the common ancestor of the down/up events is the target of the tap
				if(target) {
					if(this.supportsDoubleTap(target)) {
						this.doubleTap(e, target);
					} else {
						this.sendTap(e, target);
					}
				}
			}
			if (this.downEvent && this.downEvent.which == e.which) {
				this.downEvent = null;
			}
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
		sendTap: function(evt, target) {
			var e = this.makeEvent('tap', evt);
			e.target = target;
			enyo.dispatch(e);
		},

		/**
		* @private
		*/
		tapData: {
			id: null,
			timer: null,
			start: 0
		},

		/**
		* Global configuration for double tap support. If this is true, all tap events for Controls
		* that do not have {@link enyo.Control#doubleTapEnabled} explicitly set to false will be
		* delayed by the {@link enyo.Control#doubleTapInterval}.
		*
		* @type {Boolean}
		* @default  false
		* @public
		*/
		doubleTapEnabled: false,

		/**
		* Determines if the provided target node supports double tap events
		*
		* @param {Node} target
		* @return {Boolean}
		* @private
		*/
		supportsDoubleTap: function(target) {
			var obj = enyo.dispatcher.findDispatchTarget(target);

			if(obj) {
				// Control.doubleTapEnabled is a tri-value property. The default is 'inherit'
				// which takes its cue from gesture's doubleTapEnabled. Values of true or false
				// override the default. So, if the global is true, any truthy value on Control
				// results in true. If the global is false, only an explicit true on Control
				// results in true.
				return this.doubleTapEnabled? !!obj.doubleTapEnabled : obj.doubleTapEnabled === true;
			} else {
				return false;
			}
		},

		/**
		* private
		*/
		doubleTap: function(evt, t) {
			var obj = enyo.dispatcher.findDispatchTarget(t);

			if(this.tapData.id !== obj.id) {	// this is the first tap
				this.resetTapData(true);

				this.tapData.id = obj.id;
				this.tapData.event = evt;
				this.tapData.target = t;
				this.tapData.timer = setTimeout(enyo.bind(this, "resetTapData", true), obj.doubleTapInterval);
				this.tapData.start = enyo.perfNow();
			} else {							// this is the double tap
				var e2 = this.makeEvent('doubletap', evt);
				e2.target = t;
				e2.tapInterval = enyo.perfNow() - this.tapData.start;
				this.resetTapData(false);
				enyo.dispatch(e2);
			}
		},

		resetTapData: function(sendTap) {
			var data = this.tapData;

			if(sendTap && data.id) {
				this.sendTap(data.event, data.target);
			}

			clearTimeout(data.timer);
			data.id = data.start = data.event = data.target = data.timer = null;
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