//* @protected

/**
	Key mapping feature: Adds a _keySymbol_ property to key events, based on a
	global key mapping.  Use _enyo.dispatcher.registerKeyMap()_ to add
	keyCode-to-keySymbol mappings via a simple hash.  This method may be called
	multiple times from different libraries to mix different maps into the
	global mapping table; if conflicts arise, the last-in wins.

		enyo.dispatcher.registerKeyMap({
			415 : "play",
			413 : "stop",
			19  : "pause",
			412 : "rewind",
			417 : "fastforward"
		});
*/
enyo.dispatcher.features.push(function(e) {
	if ((e.type === "keydown") || (e.type === "keyup") || (e.type === "keypress")) {
		e.keySymbol = this.keyMap[e.keyCode];
		// Dispatch key events to be sent via Signals
		var c = this.findDefaultTarget();
		if (e.dispatchTarget !== c) {
			this.dispatchBubble(e, c);
		}
	}
});

enyo.mixin(enyo.dispatcher, {
	keyMap: {},
	registerKeyMap: function(map) {
		enyo.mixin(this.keyMap, map);
	}
});
