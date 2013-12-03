//* @protected
(function() {
	var pointerEvents;
	if (window.navigator.pointerEnabled) {
		pointerEvents = [
			"pointerdown",
			"pointerup",
			"pointermove",
			"pointerover",
			"pointerout",
			"pointercancel"
		];
	} else if (window.navigator.msPointerEnabled) {
		pointerEvents = [
			"MSPointerDown",
			"MSPointerUp",
			"MSPointerMove",
			"MSPointerOver",
			"MSPointerOut",
			"MSPointerCancel"
		];
	}
	if (pointerEvents) {
		var makeEvent = function(inEvent) {
			var e = enyo.clone(inEvent);
			e.srcEvent = inEvent;
			// normalize "mouse button" info
			// 1: left, 2: right, 3: both left & right, 4: center
			// on IE10, inEvents.buttons may be 0 for touch, so map 0 to 1
			e.which = inEvent.buttons || 1;
			return e;
		};

		var gesture = enyo.gesture;
		enyo.gesture.events = {};
		var handlers = {
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

		// alias in the older MS versions
		if (!window.navigator.pointerEnabled && window.navigator.msPointerEnabled) {
			handlers.MSPointerDown = handlers.pointerdown;
			handlers.MSPointerUp = handlers.pointerup;
			handlers.MSPointerMove = handlers.pointermove;
			handlers.MSPointerCancel = handlers.pointercancel;
			handlers.MSPointerOver = handlers.pointerover;
			handlers.MSPointerOut = handlers.pointerout;
		}

		// tell Enyo to listen for these events
		enyo.forEach(pointerEvents, function(e) {
			enyo.dispatcher.listen(document, e);
		});

		// add our transform methods to the dispatcher features list
		enyo.dispatcher.features.push(function(e) {
			if (handlers[e.type] && e.isPrimary) {
				handlers[e.type](e);
			}
		});
	}
})();