/**
An labeled item with icon and checkmark.  It is meant to go inside a <a href="#enyo.Picker">Picker</a>.
*/
enyo.kind({
	name: "enyo.PickerItem",
	kind: enyo.MenuItem,
	selectedChanged: function() {
		this.addRemoveClass("enyo-picker-item-selected", this.selected);
	}
});
