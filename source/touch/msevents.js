(function (enyo, scope) {
	
	/**
	* @private
	*/
	var pointerEvents;
	if (window.navigator.pointerEnabled) {
		pointerEvents = [
			'pointerdown',
			'pointerup',
			'pointermove',
			'pointerover',
			'pointerout',
			'pointercancel'
		];
	} else if (window.navigator.msPointerEnabled) {
		pointerEvents = [
			'MSPointerDown',
			'MSPointerUp',
			'MSPointerMove',
			'MSPointerOver',
			'MSPointerOut',
			'MSPointerCancel'
		];
	}
	if (pointerEvents) {

		/**
		* @private
		*/
		var makeEvent = function (e) {
			var event = enyo.clone(e);
			event.srcEvent = e;
			// normalize "mouse button" info
			// 1: left, 2: right, 3: both left & right, 4: center
			// on IE10, es.buttons may be 0 for touch, so map 0 to 1
			event.which = e.buttons || 1;
			return event;
		};

		/**
		* @private
		*/
		var gesture = enyo.gesture;

		/**
		* @private
		*/
		enyo.gesture.events = {};

		/**
		* @private
		*/
		var handlers = {
			pointerdown: function (e) {
				var event = makeEvent(e);
				gesture.down(event);
			},
			pointerup: function (e) {
				var event = makeEvent(e);
				gesture.up(event);
			},
			pointermove: function (e) {
				var event = makeEvent(e);
				gesture.move(event);
			},
			pointercancel: function (e) {
				// FIXME: not really the same as touchend, as touch action
				// was cancelled, but Enyo doesn't have that concept
				var event = makeEvent(e);
				gesture.up(event);
			},
			pointerover: function (e) {
				var event = makeEvent(e);
				gesture.over(event);
			},
			pointerout: function (e) {
				var event = makeEvent(e);
				gesture.out(event);
			}
		};

		/**
		* Aliases in the older MS versions.
		* 
		* @private
		*/
		if (!window.navigator.pointerEnabled && window.navigator.msPointerEnabled) {
			handlers.MSPointerDown = handlers.pointerdown;
			handlers.MSPointerUp = handlers.pointerup;
			handlers.MSPointerMove = handlers.pointermove;
			handlers.MSPointerCancel = handlers.pointercancel;
			handlers.MSPointerOver = handlers.pointerover;
			handlers.MSPointerOut = handlers.pointerout;
		}

		/**
		* Tells Enyo to listen for these [events]{@glossary event}.
		* 
		* @private
		*/
		enyo.forEach(pointerEvents, function (e) {
			enyo.dispatcher.listen(document, e);
		});

		/**
		* Adds our transform methods to the dispatcher features list.
		* 
		* @private
		*/
		enyo.dispatcher.features.push(function (e) {
			if (handlers[e.type] && e.isPrimary) {
				handlers[e.type](e);
			}
		});
	}

})(enyo, this);