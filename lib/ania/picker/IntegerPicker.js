/**
A control that allows selection from a single integer field.
The default selection range is 0-9.  You can adjust the range by setting the min and max properties.
 
	{kind: "IntegerPicker", content: "rating", min: 0, max: 10, onChange: "pickerChange"}

The selected integer can be retrieved by calling <code>getValue</code>, like so:

	pickerPick: function(inSender) {
		var rating = this.$.integerPicker.getValue();
	}
*/
enyo.kind({
	name: "enyo.IntegerPicker",
	kind: enyo.HFlexBox,
	published: {
		content: "value",
		value: 0,
		min: 0,
		max: 9
	},
	events: {
		onChange: ""
	},
	components: [
		{name: "content", className: "enyo-picker-content enyo-content"},
		{kind: "Picker"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.contentChanged();
		this.rangeChanged();
	},
	contentChanged: function() {
		this.$.content.setContent(this.content);
	},
	minChanged: function() {
		this.rangeChanged();
	},
	maxChanged: function() {
		this.rangeChanged();
	},
	rangeChanged: function() {
		var items = [];
		for (var i=this.min; i<=this.max; i++) {
			items.push(String(i));
		}
		this.$.picker.setItems(items);
		this.valueChanged();
	},
	valueChanged: function() {
		this.value = this.value >= this.min && this.value <= this.max ? this.value : this.min;
		this.$.picker.setValue(String(this.value));
	},
	pickerChange: function() {
		this.value = parseInt(this.$.picker.getValue());
		this.doChange(this.value);
	}
});
