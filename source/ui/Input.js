/**
	Implements an HTML input element with cross platform support for change events
*/
enyo.kind({
	name: "enyo.Input",
	published: {
		//* Default value of the input
		value: "",
		//* Text to display when the input is empty
		placeholder: "",
		disabled: false
	},
	events: {
		//* Sent when the input's value has changed, support for IE included.
		onInputChange: "",
		//* Sent when the input's is disabled or enabled.
		onDisabledChange: ""
	},
	//* @protected
	tag: "input",
	classes: "enyo-input",
	attributes: {
		onfocus: enyo.bubbler,
		onblur: enyo.bubbler
	},
	handlers: {
		oninput: "input",
		onclear: "clear"
	},
	create: function() {
		// FIXME: ad hoc sniff
		if (navigator.userAgent.match("MSIE")) {
			this.handlers.onkeyup = "keyup";
		}
		this.inherited(arguments);
		this.disabledChanged();
		this.placeholderChanged();
		this.valueChanged();
	},
	placeholderChanged: function() {
		this.setAttribute("placeholder", this.placeholder);
	},
	disabledChanged: function() {
		this.setAttribute("disabled", this.disabled);
		this.bubble("onDisabledChange");
	},
	getValue: function() {
		return this.getNodeProperty("value", this.value);
	},
	valueChanged: function() {
		this.setAttribute("value", this.value);
		this.setNodeProperty("value", this.value);
		this.notifyContainer();
	},
	keyup: function() {
		// ie only
		this.notifyContainer();
	},
	input: function() {
		this.notifyContainer();
	},
	notifyContainer: function() {
		this.bubble("onInputChange");
	},
	clear: function() {
		this.setValue("");
	},
	focus: function() {
		if (this.hasNode()) {
			this.node.focus();
		}
	}
});
