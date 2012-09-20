/**
	_enyo.Signals_ components are used to listen to global messages.

	An object with a Signals component can listen to messages sent from anywhere
	by declaring handlers for them.

	DOM events that have no node targets are broadcast as signals. These events
	include Window events, like _onload_ and _onbeforeunload_, and events that
	occur directly on _document_, like _onkeypress_ if _document_ has the focus.

	For more information, see the
	<a href="https://github.com/enyojs/enyo/wiki/Signals">Signals documentation</a>
	in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.Signals",
	kind: enyo.Component,
	//* @protected
	create: function() {
		this.inherited(arguments);
		enyo.Signals.addListener(this);
	},
	destroy: function() {
		enyo.Signals.removeListener(this);
		this.inherited(arguments);
	},
	notify: function(inMsg, inPayload) {
		this.dispatchEvent(inMsg, inPayload);
	},
	statics: {
		listeners: [],
		addListener: function(inListener) {
			this.listeners.push(inListener);
		},
		removeListener: function(inListener) {
			enyo.remove(inListener, this.listeners);
		},
		send: function(inMsg, inPayload) {
			enyo.forEach(this.listeners, function(l) {
				l.notify(inMsg, inPayload);
			});
		}
	}
});
