//* @protected

/**
	Event modal capture feature: capture events to a specific
	control via enyo.dispatcher.capture(inControl, inShouldForward)
	release events via enyo.dispatcher.release()
*/
enyo.dispatcher.features.push(function(e) {
	enyo.dispatcher.captureFilter(e.dispatchTarget, e, true);
});

//
//	NOTE: This object is a plug-in; these methods should
//	be called on _enyo.dispatcher_, and not on the plug-in itself.
//
enyo.mixin(enyo.dispatcher, {
	noCaptureEvents: {load: 1, unload:1, error: 1, transitionend: 1, animationend: 1},
	autoForwardEvents: {leave: 1, resize: 1},
	captures: [],
	/** 
		Capture events for `inTarget` and optionally forward them.  The third parameter 
		(inEvents) is optional; if set as a hash of event names mapped to truthy values,
		only those events will be captured.  Otherwise, most events (except those defined
		in `enyo.dispatcher.noCaptureEvents` will be captured).
	*/
	capture: function(inTarget, inShouldForward, inEvents) {
		var info = {target: inTarget, forward: inShouldForward, events: inEvents};
		this.captures.push(info);
		this.setCaptureInfo(info);
	},
	//* Remove the specified target from the capture list
	release: function(inTarget) {
		for (var i = this.captures.length - 1; i >= 0; i--) {
			if (this.captures[i].target === inTarget) {
				this.captures.splice(i,1);
				this.setCaptureInfo(this.captures[this.captures.length-1]);
				break;
			}
		}
	},
	//* Set the information for a captured event
	setCaptureInfo: function(inInfo) {
		this.captureTarget = inInfo && inInfo.target;
		this.forwardEvents = inInfo && inInfo.forward;
		this.captureEvents = inInfo && inInfo.events;
	},
	//* Allows custom events to be manually filtered
	captureFilter: function(inTarget, inEvent, inFromDOM) {
		var c = inTarget, e = inEvent;
		var wants = this.captureTarget && ((this.captureEvents && this.captureEvents[e.type]) || (!this.captureEvents && !this.noCaptureEvents[e.type]));
		var needs = wants && !(c && c.isDescendantOf && c.isDescendantOf(this.captureTarget));
		if (needs) {
			var c1 = e.captureTarget = this.captureTarget;
			// NOTE: We do not want releasing capture while an event is being processed to alter
			// the way the event propagates. Therefore decide if the event should forward
			// before the capture target receives the event (since it may release capture).
			var shouldForward = (this.autoForwardEvents[e.type] || this.forwardEvents);
			e.captured = true;
			if (inFromDOM) {
				// Bubble as DOM event (type has no "on" prefix)
				this.dispatchBubble(e, c1);
			} else {
				// Bubble as custom event (type already "on"-prefixed)
				c1.dispatchBubble(e.type, e, c1);
			}
			delete e.captured;
			if (!shouldForward) {
				e.preventDispatch = true;
			}
		}
	}
});