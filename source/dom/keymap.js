(function (enyo, scope) {
	/**
	* Key mapping feature: Adds a `keySymbol` property to key [events]{@glossary event},
	* based on a global key mapping. Use
	* [enyo.dispatcher.registerKeyMap()]{@link enyo.dispatcher.registerKeyMap} to add
	* keyCode-to-keySymbol mappings via a simple hash. This method may be called
	* multiple times from different libraries to mix different maps into the global
	* mapping table; if conflicts arise, the last-in wins.
	*
	* ```
	* enyo.dispatcher.registerKeyMap({
	* 	415 : 'play',
	* 	413 : 'stop',
	* 	19  : 'pause',
	* 	412 : 'rewind',
	* 	417 : 'fastforward'
	* });
	* ```
	* 
	* @private
	*/
	enyo.dispatcher.features.push(function(e) {
		if ((e.type === 'keydown') || (e.type === 'keyup') || (e.type === 'keypress')) {
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

})(enyo, this);