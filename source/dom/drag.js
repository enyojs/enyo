(function (enyo, scope) {

	/**
	* @private
	*/
	enyo.dispatcher.features.push(
		function(e) {
			// NOTE: beware of properties in enyo.gesture inadvertently mapped to event types
			if (enyo.gesture.drag[e.type]) {
				return enyo.gesture.drag[e.type](e);
			}
		}
	);

	/**
	* Enyo supports a cross-platform set of drag [events]{@glossary event}. These
	* events allow users to write a single set of event handlers for applications
	* that run on both mobile and desktop platforms.
	*
	* The following events are provided:
	*
	* * 'dragstart'
	* * 'dragfinish'
	* * 'drag'
	* * 'drop'
	* * 'dragover'
	* * 'dragout'
	* * 'hold'
	* * 'release'
	* * 'holdpulse'
	* * 'flick'
	*
	* For more information on these events, see the documentation on
	* [Event Handling]{@linkplain $dev-guide/key-concepts/event-handling.html} in
	* the Enyo Developer Guide.
	*
	* @namespace enyo.gesture.drag
	* @public
	*/
	enyo.gesture.drag =
		/** @lends enyo.gesture.drag */ {

		/**
		* @private
		*/
		holdPulseDefaultConfig: {
			frequency: 200,
			events: [{name: 'hold', time: 200}],
			resume: false,
			moveTolerance: 16,
			endHold: 'onMove'
		},

		/**
		* Call this method to specify the framework's 'holdPulse' behavior, which
		* determines the nature of the events generated when a user presses and holds
		* on a user interface element.
		*
		* By default, an `onhold` event fires after 200 ms. After that, an `onholdpulse`
		* event fires every 200 ms until the user stops holding, at which point a
		* `onrelease` event fires.
		*
		* To change the default behavior, call this method and pass it a holdPulse
		* configuration object. The holdPulse configuration object has a number of
		* properties.
		*
		* You can specify a set of custom hold events by setting the `events` property
		* to an array containing one or more objects. Each object specifies a custom
		* hold event, in the form of a `name` / `time` pair. Notes:
		*
		*  * Your custom event names should not include the 'on' prefix; that will be
		*    added automatically by the framework.
		*
		*  * Times should be specified in milliseconds.
		*
		*  * Your `events` array overrides the framework defaults entirely, so if you
		*    want the standard `hold` event to fire at 200 ms (in addition to whatever
		*    custom events you define), you'll need to redefine it yourself as part of
		*    your `events` array.
		*
		* Regardless of how many custom hold events you define, `onholdpulse` events
		* will start firing after the first custom hold event fires, and continue until
		* the user stops holding. Likewise, only one `onrelease` event will fire,
		* regardless of how many custom hold events you define.
		*
		* The`frequency` parameter determines not only how often `holdpulse` events are
		* sent, but the frequency with which the hold duration is measured. This means
		* that the value you set for `frequency` should always be a common factor of the
		* times you set for your custom hold events, to ensure accurate event timing.
		*
		* You can use the `endHold` property to specify the circumstances under which a
		* hold is considered to end. Set `endHold` to `onMove` (the default) if you want
		* the hold to end as soon as the user's finger or pointer moves. Set `endHold`
		* to `onLeave` if you want the hold to end only when the finger or pointer
		* leaves the element altogether. When specifying `onMove`, you can also provide
		* a `moveTolerance` value (default: `16`) that determines how tolerant you want
		* to be of small movements when deciding whether a hold has ended. The higher
		* the value, the further a user's finger or pointer may move without causing
		* the hold to end.
		*
		* Finally, the `resume` parameter (default: `false`) specifies whether a hold
		* that has ended due to finger / pointer movement should be resumed if the
		* user's finger or pointer moves back inside the tolerance threshold (in the
		* case of `endHold: onMove`) or back over the element (in the case of
		* `endHold: onLeave`).
		*
		* Here is an example:
		*
		* ```
		* enyo.gesture.drag.configureHoldPulse({
		*     frequency: 100,
		*     events: [
		*         {name: 'hold', time: 200},
		*         {name: 'longpress', time: 500}
		*     ],
		*     endHold: 'onLeave',
		*     resume: true
		* });
		* ```
		* For comparison, here are the out-of-the-box defaults:
		*
		* ```
		* enyo.gesture.drag.configureHoldPulse({
		*     frequency: 200,
		*     events: [
		*         {name: 'hold', time: 200}
		*     ],
		*     endHold: 'onMove',
		*     moveTolerance: 16,
		*     resume: false
		* });
		* ```
		*
		* The settings you provide via this method will be applied globally, affecting
		* every Control. Note that you can also override the defaults on a case-by-case
		* basis by handling the `down` event for any Control and calling the
		* `configureHoldPulse` method exposed by the event itself. That method works
		* exactly like this one, except that the settings you provide will apply only to
		* holds on that particular Control.
		*
		* @public
		*/
		configureHoldPulse: function(config) {
			// TODO: Might be nice to do some validation, error handling
			this.holdPulseDefaultConfig = config;
		},

		/**
		* @private
		*/
		holdPulseConfig: {},

		/**
		* @private
		*/
		trackCount: 5,

		/**
		* @private
		*/
		minFlick: 0.1,

		/**
		* @private
		*/
		minTrack: 8,

		/**
		* @private
		*/
		down: function(e) {
			// tracking if the mouse is down
			//enyo.log('tracking ON');
			// Note: 'tracking' flag indicates interest in mousemove, it's turned off
			// on mouseup
			// make sure to stop dragging in case the up event was not received.
			this.stopDragging(e);
			this.target = e.target;
			this.startTracking(e);
		},

		/**
		* @private
		*/
		move: function(e) {
			if (this.tracking) {
				this.track(e);
				// If the mouse is not down and we're tracking a drag, abort.
				// this error condition can occur on IE/Webkit after interaction with a scrollbar.
				if (!e.which) {
					this.stopDragging(e);
					this.endHold();
					this.tracking = false;
					//enyo.log('enyo.gesture.drag: mouse must be down to drag.');
					return;
				}
				if (this.dragEvent) {
					this.sendDrag(e);
				} else if (this.holdPulseConfig.endHold === 'onMove') {
					if (this.dy*this.dy + this.dx*this.dx >= this.holdPulseConfig.moveTolerance) { // outside of target
						if (this.holdJob) { // only stop/cancel hold job if it currently exists
							if (this.holdPulseConfig.resume) { // pause hold to potentially resume later
								this.suspendHold();
							} else { // completely cancel hold
								this.endHold();
								this.sendDragStart(e);
							}
						}
					} else if (this.holdPulseConfig.resume && !this.holdJob) { // when moving inside target, only resume hold job if it was previously paused
						this.resumeHold();
					}
				}
			}
		},

		/**
		* @private
		*/
		up: function(e) {
			this.endTracking(e);
			this.stopDragging(e);
			this.endHold();
			this.target = null;
		},

		/**
		* @private
		*/
		enter: function(e) {
			// resume hold when re-entering original target when using 'onLeave' endHold value
			if (this.holdPulseConfig.resume && this.holdPulseConfig.endHold === 'onLeave' && this.target && e.target === this.target) {
				this.resumeHold();
			}
		},

		/**
		* @private
		*/
		leave: function(e) {
			if (this.dragEvent) {
				this.sendDragOut(e);
			} else if (this.holdPulseConfig.endHold === 'onLeave') {
				if (this.holdPulseConfig.resume) { // pause hold to potentially resume later
					this.suspendHold();
				} else { // completely cancel hold
					this.endHold();
					this.sendDragStart(e);
				}
			}
		},

		/**
		* @private
		*/
		stopDragging: function(e) {
			if (this.dragEvent) {
				this.sendDrop(e);
				var handled = this.sendDragFinish(e);
				this.dragEvent = null;
				return handled;
			}
		},

		/**
		* @private
		*/
		makeDragEvent: function(inType, inTarget, inEvent, inInfo) {
			var adx = Math.abs(this.dx), ady = Math.abs(this.dy);
			var h = adx > ady;
			// suggest locking if off-axis < 22.5 degrees
			var l = (h ? ady/adx : adx/ady) < 0.414;
			var e = {};
			// var e = {
			e.type = inType;
			e.dx = this.dx;
			e.dy = this.dy;
			e.ddx = this.dx - this.lastDx;
			e.ddy = this.dy - this.lastDy;
			e.xDirection = this.xDirection;
			e.yDirection = this.yDirection;
			e.pageX = inEvent.pageX;
			e.pageY = inEvent.pageY;
			e.clientX = inEvent.clientX;
			e.clientY = inEvent.clientY;
			e.horizontal = h;
			e.vertical = !h;
			e.lockable = l;
			e.target = inTarget;
			e.dragInfo = inInfo;
			e.ctrlKey = inEvent.ctrlKey;
			e.altKey = inEvent.altKey;
			e.metaKey = inEvent.metaKey;
			e.shiftKey = inEvent.shiftKey;
			e.srcEvent = inEvent.srcEvent;
			// };
			//Fix for IE8, which doesn't include pageX and pageY properties
			if(enyo.platform.ie==8 && e.target) {
				e.pageX = e.clientX + e.target.scrollLeft;
				e.pageY = e.clientY + e.target.scrollTop;
			}
			e.preventDefault = enyo.gesture.preventDefault;
			e.disablePrevention = enyo.gesture.disablePrevention;
			return e;
		},

		/**
		* @private
		*/
		sendDragStart: function(e) {
			//enyo.log('dragstart');
			this.dragEvent = this.makeDragEvent('dragstart', this.target, e);
			enyo.dispatch(this.dragEvent);
		},

		/**
		* @private
		*/
		sendDrag: function(e) {
			//enyo.log('sendDrag to ' + this.dragEvent.target.id + ', over to ' + e.target.id);
			// send dragOver event to the standard event target
			var synth = this.makeDragEvent('dragover', e.target, e, this.dragEvent.dragInfo);
			enyo.dispatch(synth);
			// send drag event to the drag source
			synth.type = 'drag';
			synth.target = this.dragEvent.target;
			enyo.dispatch(synth);
		},

		/**
		* @private
		*/
		sendDragFinish: function(e) {
			//enyo.log('dragfinish');
			var synth = this.makeDragEvent('dragfinish', this.dragEvent.target, e, this.dragEvent.dragInfo);
			synth.preventTap = function() {
				if (e.preventTap) {
					e.preventTap();
				}
			};
			enyo.dispatch(synth);
		},

		/**
		* @private
		*/
		sendDragOut: function(e) {
			var synth = this.makeDragEvent('dragout', e.target, e, this.dragEvent.dragInfo);
			enyo.dispatch(synth);
		},

		/**
		* @private
		*/
		sendDrop: function(e) {
			var synth = this.makeDragEvent('drop', e.target, e, this.dragEvent.dragInfo);
			synth.preventTap = function() {
				if (e.preventTap) {
					e.preventTap();
				}
			};
			enyo.dispatch(synth);
		},

		/**
		* @private
		*/
		startTracking: function(e) {
			this.tracking = true;
			// note: use clientX/Y to be compatible with ie8
			this.px0 = e.clientX;
			this.py0 = e.clientY;
			// this.flickInfo = {startEvent: e, moves: []};
			this.flickInfo = {};
			this.flickInfo.startEvent = e;
			// FIXME: so we're trying to reuse objects where possible, should
			// do the same in scenarios like this for arrays
			this.flickInfo.moves = [];
			this.track(e);
		},

		/**
		* @private
		*/
		track: function(e) {
			this.lastDx = this.dx;
			this.lastDy = this.dy;
			this.dx = e.clientX - this.px0;
			this.dy = e.clientY - this.py0;
			this.xDirection = this.calcDirection(this.dx - this.lastDx, 0);
			this.yDirection = this.calcDirection(this.dy - this.lastDy, 0);
			//
			var ti = this.flickInfo;
			ti.moves.push({
				x: e.clientX,
				y: e.clientY,
				t: enyo.perfNow()
			});
			// track specified # of points
			if (ti.moves.length > this.trackCount) {
				ti.moves.shift();
			}
		},

		/**
		* @private
		*/
		endTracking: function() {
			this.tracking = false;
			var ti = this.flickInfo;
			var moves = ti && ti.moves;
			if (moves && moves.length > 1) {
				// note: important to use up time to reduce flick
				// velocity based on time between move and up.
				var l = moves[moves.length-1];
				var n = enyo.perfNow();
				// take the greatest of flick between each tracked move and last move
				for (var i=moves.length-2, dt=0, x1=0, y1=0, x=0, y=0, sx=0, sy=0, m; (m=moves[i]); i--) {
					// this flick (this move - last move) / (this time - last time)
					dt = n - m.t;
					x1 = (l.x - m.x) / dt;
					y1 = (l.y - m.y) / dt;
					// establish flick direction
					sx = sx || (x1 < 0 ? -1 : (x1 > 0 ? 1 : 0));
					sy = sy || (y1 < 0 ? -1 : (y1 > 0 ? 1 : 0));
					// if either axis is a greater flick than previously recorded use this one
					if ((x1 * sx > x * sx) || (y1 * sy > y * sy)) {
						x = x1;
						y = y1;
					}
				}
				var v = Math.sqrt(x*x + y*y);
				if (v > this.minFlick) {
					// generate the flick using the start event so it has those coordinates
					this.sendFlick(ti.startEvent, x, y, v);
				}
			}
			this.flickInfo = null;
		},

		/**
		* @private
		*/
		calcDirection: function(inNum, inDefault) {
			return inNum > 0 ? 1 : (inNum < 0 ? -1 : inDefault);
		},

		/**
		* Translate the old format for holdPulseConfig to the new one, to
		* preserve backward compatibility.
		*
		* @private
		*/
		normalizeHoldPulseConfig: function (oldOpts) {
			var nOpts = enyo.clone(oldOpts);
			nOpts.frequency = nOpts.delay;
			nOpts.events = [{name: 'hold', time: nOpts.delay}];
			return nOpts;
		},

		/**
		* Method to override holdPulseConfig for a given gesture. This method isn't
		* accessed directly from enyo.gesture.drag, but exposed by the `down` event.
		* See `prepareHold()`.
		*
		* @private
		*/
		_configureHoldPulse: function(opts) {
			var nOpts = (opts.delay === undefined) ?
				opts :
				this.normalizeHoldPulseConfig(opts);
			enyo.mixin(this.holdPulseConfig, nOpts);
		},

		/**
		* @private
		*/
		prepareHold: function(e) {
			// quick copy as the prototype of the new overridable config
			this.holdPulseConfig = enyo.clone(this.holdPulseDefaultConfig, true);

			// expose method for configuring holdpulse options
			e.configureHoldPulse = this._configureHoldPulse.bind(this);
		},

		/**
		* @private
		*/
		beginHold: function(e) {
			var ce;
			// cancel any existing hold since it's possible in corner cases to get a down without an up
			this.endHold();
			this.holdStart = enyo.perfNow();
			this._holdJobFunction = enyo.bind(this, 'handleHoldPulse');
			// clone the event to ensure it stays alive on IE upon returning to event loop
			ce = this._holdJobEvent = enyo.clone(e);
			ce.srcEvent = enyo.clone(e.srcEvent);
			this._pulsing = false;
			this._unsent = enyo.clone(this.holdPulseConfig.events);
			this._unsent.sort(this.sortEvents);
			this._next = this._unsent.shift();
			if (this._next) {
				this.holdJob = setInterval(this._holdJobFunction, this.holdPulseConfig.frequency);
			}
		},

		/**
		* @private
		*/
		resumeHold: function() {
			this.handleHoldPulse();
			this.holdJob = setInterval(this._holdJobFunction, this.holdPulseConfig.frequency);
		},

		/**
		* @private
		*/
		sortEvents: function(a, b) {
				if (a.time < b.time) return -1;
				if (a.time > b.time) return 1;
				return 0;
		},

		/**
		* @private
		*/
		endHold: function() {
			var e = this._holdJobEvent;
			this.suspendHold();
			if (e && this._pulsing) {
				this.sendRelease(e);
			}
			this._pulsing = false;
			this._unsent = null;
			this._holdJobFunction = null;
			this._holdJobEvent = null;
			this._next = null;
		},

		/**
		* @private
		*/
		suspendHold: function() {
			clearInterval(this.holdJob);
			this.holdJob = null;
		},

		/**
		* @private
		*/
		handleHoldPulse: function() {
			var holdTime = enyo.perfNow() - this.holdStart,
				hje = this._holdJobEvent,
				e;
			this.maybeSendHold(hje, holdTime);
			if (this._pulsing) {
				e = enyo.gesture.makeEvent('holdpulse', hje);
				e.holdTime = holdTime;
				enyo.dispatch(e);
			}
		},

		/**
		* @private
		*/
		maybeSendHold: function(inEvent, inHoldTime) {
			var n = this._next;
			while (n && n.time <= inHoldTime) {
				var e = enyo.gesture.makeEvent(n.name, inEvent);
				this._pulsing = true;
				enyo.dispatch(e);
				n = this._next = this._unsent.shift();
			}
		},

		/**
		* @private
		*/
		sendRelease: function(inEvent) {
			var e = enyo.gesture.makeEvent('release', inEvent);
			enyo.dispatch(e);
		},

		/**
		* @private
		*/
		sendFlick: function(inEvent, inX, inY, inV) {
			var e = enyo.gesture.makeEvent('flick', inEvent);
			e.xVelocity = inX;
			e.yVelocity = inY;
			e.velocity = inV;
			enyo.dispatch(e);
		}
	};

})(enyo, this);