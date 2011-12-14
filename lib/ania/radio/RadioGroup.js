/**
A group of <a href="#enyo.RadioButton">RadioButton</a> objects
laid out horizontally. Within the same radio group, tapping on one radio button
will release any previously tapped radio button. The onChange event is fired
when the selected radio button is changed.

	{kind: "RadioGroup", onChange: "radioButtonSelected", components: [
		{content: "foo"},
		{content: "bar"},
		{content: "baz"}
	]}

To get the value (or index) of the currently selected button, use getValue():

	radioButtonSelected: function(inSender) {
		this.log("Selected button" + inSender.getValue());
	}
*/
enyo.kind({
	name: "enyo.RadioGroup",
	kind: enyo.OrderedContainer,
	defaultKind: "RadioButton",
	className: "enyo-radiogroup",
	published: {
		value: 0
	},
	events: {
		onChange: ""
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.valueChanged();
	},
	valueChanged: function(inOldValue) {
		this.setRadioDepressed(inOldValue, false);
		this.setRadioDepressed(this.value, true);
	},
	setRadioDepressed: function(inValue, inDepressed) {
		var c = this.fetchControlByValue(inValue);
		if (c) {
			c.setDepressed(inDepressed);
		}
	},
	fetchControlByValue: function(inValue) {
		var c$ = this.controls;
		for (var i=0, c; c=c$[i]; i++) {
			if (c.getValue() == inValue) {
				return c;
			}
		}
	},
	radioButtonClick: function(inSender) {
		var oldValue = this.value;
		this.setValue(inSender.getValue());
		if (this.value != oldValue) {
			this.doChange(this.value);
		}
	}
});
