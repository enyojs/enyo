//* @protected
(function() {
	// add touch-specific gesture feature
	var gesture = enyo.gesture;
	if (window.navigator.pointerEnabled || window.navigator.msPointerEnabled) {
		var pointerEvents = [
			"MSPointerDown",
			"MSPointerUp",
			"MSPointerMove",
			"MSPointerOver",
			"MSPointerOut",
			"MSPointerCancel",
			"pointerdown",
			"pointerup",
			"pointermove",
			"pointerover",
			"pointerout",
			"pointercancel"
			// FIXME: don't register for MSGesture events
			// until we have code to handle them
			// "MSGestureTap",
			// "MSGestureDoubleTap",
			// "MSGestureHold",
			// "MSGestureStart",
			// "MSGestureChange",
			// "MSGestureEnd",
		];
		enyo.forEach(pointerEvents, function(e) {
			enyo.dispatcher.listen(document, e);
		});
		// add our own MSPointer event handler
		enyo.dispatcher.features.push(function(e) {
			if (handlers[e.type] && e.isPrimary) {
				handlers[e.type](e);
			}
		});
		// remove the default mouse event handlers
		enyo.gesture.events = {};

		var makeEvent = function(inEvent) {
			var e = enyo.clone(inEvent);
			e.srcEvent = inEvent;
			// normalize "mouse button" info
			e.which = 1;
			return e;
		};

		var handlers = {
			// FIXME: need to register for gestures in MSPointerDown
			// according to Microsoft docs
			/*MSGestureStart: function(inEvent) {
				enyo.dispatch(gestureNormalize("gesturestart", inEvent));
			},
			MSGestureChange: function(inEvent) {
				enyo.dispatch(gestureNormalize("gesturechange", inEvent));
			},
			MSGestureEnd: function(inEvent) {
				enyo.dispatch(gestureNormalize("gestureend", inEvent));
			},*/
			pointerdown: function(inEvent) {
				var e = makeEvent(inEvent);
				gesture.down(e);
			},
			pointerup: function(inEvent) {
				var e = makeEvent(inEvent);
				gesture.up(e);
			},
			pointermove: function(inEvent) {
				var e = makeEvent(inEvent);
				gesture.move(e);
			},
			pointercancel: function(inEvent) {
				// FIXME: not really the same as touchend, as touch action
				// was cancelled, but Enyo doesn't have that concept
				var e = makeEvent(inEvent);
				gesture.up(e);
			},
			pointerover: function(inEvent) {
				var e = makeEvent(inEvent);
				gesture.over(e);
			},
			pointerout: function(inEvent) {
				var e = makeEvent(inEvent);
				gesture.out(e);
			}
		};
		// assign MS specific handlers too for IE10 support
		handlers.MSPointerDown = handlers.pointerdown;
		handlers.MSPointerUp = handlers.pointerup;
		handlers.MSPointerMove = handlers.pointermove;
		handlers.MSPointerOut = handlers.pointerout;
		handlers.MSPointerCancel = handlers.pointercancel;
		handlers.MSPointerOver = handlers.pointerover;
	}
})();