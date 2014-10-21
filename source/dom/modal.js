(function (enyo, scope) {

	/**
	* Event modal capture feature. Capture events to a specific control via
	* [enyo.dispatcher.capture(inControl, inShouldForward)]{@linkcode enyo.dispatcher.capture};
	* release events via [enyo.dispatcher.release()]{@link enyo.dispatcher.release}.
	*
	* @private
	*/
	enyo.dispatcher.features.push(function(e) {
		if (this.captureTarget) {
			var c = e.dispatchTarget;
			var eventName = (e.customEvent ? '' : 'on') + e.type;
			var handlerName = this.captureEvents[eventName];
			var handlerScope = this.captureHandlerScope || this.captureTarget;
			var handler = handlerName && handlerScope[handlerName];
			var shouldCapture = handler && !(c && c.isDescendantOf && c.isDescendantOf(this.captureTarget));
			if (shouldCapture) {
				var c1 = e.captureTarget = this.captureTarget;
				// NOTE: We do not want releasing capture while an event is being processed to alter
				// the way the event propagates. Therefore decide if the event should forward
				// before the capture target receives the event (since it may release capture).
				e.preventDispatch = handler && handler.apply(handlerScope, [c1, e]) && !this.autoForwardEvents[e.type];
			}
		}
	});

	//
	//        NOTE: This object is a plug-in; these methods should
	//        be called on `enyo.dispatcher`, and not on the plug-in itself.
	//
	enyo.mixin(enyo.dispatcher, {

		/**
		* @private
		*/
		autoForwardEvents: {leave: 1, resize: 1},

		/**
		* @private
		*/
		captures: [],

		/** 
		* Captures [events]{@glossary event} for `inTarget`, where `inEvents` is specified as a
		* hash of event names mapped to callback handler names to be called on `inTarget` (or,
		* optionally, `inScope`). The callback is called when any of the captured events are
		* dispatched outside of the capturing control. Returning `true` from the callback stops
		* dispatch of the event to the original `dispatchTarget`.
		*
		* @private
		*/
		capture: function(inTarget, inEvents, inScope) {
			var info = {target: inTarget, events: inEvents, scope: inScope};
			this.captures.push(info);
			this.setCaptureInfo(info);
		},

		/**
		* Removes the specified target from the capture list.
		* 
		* @private
		*/
		release: function(inTarget) {
			for (var i = this.captures.length - 1; i >= 0; i--) {
				if (this.captures[i].target === inTarget) {
					this.captures.splice(i,1);
					this.setCaptureInfo(this.captures[this.captures.length-1]);
					break;
				}
			}
		},

		/**
		* Sets the information for a captured {@glossary event}.
		* 
		* @private
		*/
		setCaptureInfo: function(inInfo) {
			this.captureTarget = inInfo && inInfo.target;
			this.captureEvents = inInfo && inInfo.events;
			this.captureHandlerScope = inInfo && inInfo.scope;
		}
	});

})(enyo, this);