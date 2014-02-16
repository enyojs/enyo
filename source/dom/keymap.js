/*
	Copyright 2014 LG Electronics, Inc.

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/
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
