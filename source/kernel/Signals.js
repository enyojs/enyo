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
