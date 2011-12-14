/**
A control that looks like a switch with labels for two states. Each time a ToggleButton is tapped,
it switches its value and fires an onChange event.

	{kind: "ToggleButton", onContent: "foo", offContent: "bar", onChange: "buttonToggle"}

	buttonToggle: function(inSender, inValue) {
		this.log("Toggled to value" + inValue);
	}

To find out the value of the button, use getValue:

	queryToggleValue: function() {
		return this.$.toggleButton.getValue();
	}
*/
enyo.kind({
	name: "enyo.ToggleButton", 
	kind: enyo.Control,
	published: {
		value: false,
		onContent: enyo._$L("On"),
		offContent: enyo._$L("Off"),
		disabled: false
	},
	events: {
		/**
		The onChange event fires when the user changes the value of the toggle button, 
		but not when the value is changed programmatically.
		*/
		onChange: ""
	},
	className: "enyo-toggle-button",
	layoutKind: "HFlexLayout", 
	align: "center",
	components: [
		{name: "bar", className: "enyo-toggle-button-bar", components: [
			{name: "contentOn", tagName: "span", className: "enyo-toggle-content-on", content: "On"},
			{name: "contentOff", tagName: "span", className: "enyo-toggle-content-off", content: "Off"}
		]}
	],
	//* @protected
	contents: {"true": "ON&nbsp;", "false": "OFF"},
	ready: function() {
		this.valueChanged();
		this.onContentChanged();
		this.offContentChanged();
		this.disabledChanged();
	},
	onContentChanged: function() {
		this.$.contentOn.setContent(this.onContent);
	},
	offContentChanged: function() {
		this.$.contentOff.setContent(this.offContent);
	},
	valueChanged: function() {
		this.$.bar.setClassName("enyo-toggle-button-bar " + (this.value ? "on" : "off"));
		this.$.contentOn.applyStyle("display", this.value ? "inline" : "none");
		this.$.contentOff.applyStyle("display", this.value ? "none" : "inline");
	},
	disabledChanged: function() {
		this.$.bar.addRemoveClass("disabled", this.disabled);
		this.$.contentOn.addRemoveClass("enyo-disabled", this.disabled);
		this.$.contentOff.addRemoveClass("enyo-disabled", this.disabled);
	},
	updateValue: function(inValue) {
		if (!this.disabled) {
			this.setValue(inValue);
			this.doChange(this.value);
		}
	},
	clickHandler: function() {
		this.updateValue(!this.getValue());
	},
	flickHandler: function(inSender, inEvent) {
		if (Math.abs(inEvent.xVel) > Math.abs(inEvent.yVel)) {
			this.updateValue(inEvent.xVel > 0);
		}
	},
	dragstartHandler: function(inSender, inEvent) {
		this._dx0 = inEvent.dx;
	},
	dragHandler: function(inSender, inEvent) {
		var d = inEvent.dx - this._dx0;
		if (Math.abs(d) > 15) {
			this.updateValue(d > 0);
			this._dx0 = inEvent.dx;
		}
	},
	dragfinishHandler: function(inSender, inEvent) {
		inEvent.preventClick();
	}
});
