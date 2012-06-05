/**
	Signals components are used to listen to global messages.

	An object with a Signals component can listen to messages sent from anywhere but declaring
	handlers for them.

	DOM events that have no node targets are broadcast as signals. This events include Window 
	events, like _onload_ and _onbeforeunload_, and events that occur directly on document,
	like _onkeypress_ if document has the focus.

	For example, setting the _on<MessagName>_ property to the name of a owner method causes that
	method to be called when 'on<MessagName>' is broadcast, for any <MessageName>.

	Example:

		enyo.kind({
			name: "Receiver",
			components: [
				// 'onTransmission' is the message name, 'transmission' is the name of a method in my owner
				{kind: "Signals", onTransmission: "transmission"}
			],
			// signal handlers receives two parameters like all Enyo message handlers: a reference to the 
			// component that handed us this message (in this case, our own signals object _this.$.signals_),
			// and any payload the  transmitter included in the broadcast.
			transmission: function(inSender, inPayload) {
			}
		});

	To broadcast a message, call the send()_ static method on the _enyo.Signals_ kind.

		enyo.kind({
			name: "Sender",
			transmit: function(inPayload) {
				enyo.Signals.send("onTransmission", inPayload);
			}
		});

	Important notes:
	
	* the signal name sent to `send` must match exactly the property on receiver Signals, both must include the _on_ prefix.
	* all Signals instances that register a handler for a particular message name will receive the message
	* the _send_ method is on _enyo.Signals_ kind itself, not an instance of a Signals component.

	Do not abuse Signals. Coupling objects with global communication is considered evil.
*/
enyo.kind({
	name: "enyo.Signals",
	kind: enyo.Component,
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
