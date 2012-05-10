/**
	Implements an HTML input element with cross platform support for change events
*/
enyo.kind({
	name: "enyo.Input",
	published: {
		/**
			Value of the input. Use this property only to initialize the value. Use _getValue()_ and _setValue()_ to
			manipulate the value at runtime.
		*/
		value: "",
		//* Text to display when the input is empty
		placeholder: "",
		type: "",
		disabled: false
	},
	events: {
		//* Sent when the input's is disabled or enabled.
		onDisabledChange: ""
	},
	//* Set to true to focus this control when it is rendered.
	defaultFocus: false,
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
		if (enyo.platform.ie) {
			this.handlers.onkeyup = "iekeyup";
		}
		this.inherited(arguments);
		this.placeholderChanged();
		// prevent overriding a custom attribute with null
		if (this.type) {
			this.typeChanged();
		}
		this.valueChanged();
	},
	rendered: function() {
		this.inherited(arguments);
		this.disabledChanged();
		if (this.defaultFocus) {
			this.focus();
		}
	},
	typeChanged: function() {
		this.setAttribute("type", this.type);
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
	},
	iekeyup: function(inSender, inEvent) {
		var ie = enyo.platform.ie, kc = inEvent.keyCode;
		// input event missing on ie 8, fails to fire on backspace and delete keys in ie 9
		if (ie <= 8 || (ie == 9 && (kc == 8 || kc == 46))) {
			this.bubble("oninput", inEvent);
		}
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
