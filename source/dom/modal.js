//* Event modal capture feature: capture events to a specific
// control via enyo.dispatcher.capture(inControl, inShouldForward)
// release events via enyo.dispatcher.release()
//* @protected
enyo.dispatcher.features.push(function(e) {
	var c = e.dispatchTarget;
	// prevent capturing events that go to the rootHandler as these events do not target an enyo control
	var wants = this.captureTarget && (c != enyo.dispatcher.rootHandler) && !this.noCaptureEvents[e.type];
	var needs = wants && (!c || !c.isDescendantOf(this.captureTarget));
	if (needs) {
		var c1 = e.captureTarget = this.captureTarget;
		this.dispatchBubble(e, c1);
		if (!(this.autoForwardEvents[e.type] || this.forwardEvents)) {
			e.preventDispatch = true;
		}
	}
});
//
//	NOTE: This object is a plug-in; these methods should 
//	be called on _enyo.dispatcher_, and not on the plug-in itself.
//
enyo.mixin(enyo.dispatcher, {
	noCaptureEvents: {load: 1, unload:1, error: 1},
	autoForwardEvents: {leave: 1},
	captures: [],
	//* Capture events for `inTarget` and optionally forward them
	capture: function(inTarget, inShouldForward) {
		var info = {target: inTarget, forward: inShouldForward};
		this.captures.push(info);
		this.setCaptureInfo(info);
	},
	//* Release the last captured event
	release: function() {
		this.captures.pop();
		this.setCaptureInfo(this.captures[this.captures.length-1]);
	},
	//* Set the information for a captured event
	setCaptureInfo: function(inInfo) {
		this.captureTarget = inInfo && inInfo.target;
		this.forwardEvents = inInfo && inInfo.forward;
	}
});
