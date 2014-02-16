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
/**
	_enyo.Signals_ components are used to listen to global messages.

	An object with a Signals component can listen to messages sent from anywhere
	by declaring handlers for them.

	DOM events that have no node targets are broadcast as signals. These events
	include Window events, like _onload_ and _onbeforeunload_, and events that
	occur directly on _document_, like _onkeypress_ if _document_ has the focus.

	For more information, see the documentation on [Event
	Handling](key-concepts/event-handling.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.Signals",
	kind: "enyo.Component",
	//* @protected
	// needed because of early calls to bind DOM event listeners
	// to the enyo.Signals.send call.
	noDefer: true,
	create: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			enyo.Signals.addListener(this);
		};
	}),
	destroy: enyo.inherit(function (sup) {
		return function() {
			enyo.Signals.removeListener(this);
			sup.apply(this, arguments);
		};
	}),
	notify: function(inMsg, inPayload) {
		this.dispatchEvent(inMsg, inPayload);
	},
	protectedStatics: {
		listeners: [],
		addListener: function(inListener) {
			this.listeners.push(inListener);
		},
		removeListener: function(inListener) {
			enyo.remove(inListener, this.listeners);
		}
	},
	statics: {
		send: function(inMsg, inPayload) {
			enyo.forEach(this.listeners, function(l) {
				l.notify(inMsg, inPayload);
			});
		}
	}
});
