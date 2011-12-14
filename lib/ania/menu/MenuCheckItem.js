/**
An labeled item with icon and checkmark.  It is meant to go inside a <a href="#enyo.Menu">Menu</a>.
*/
enyo.kind({
	name: "enyo.MenuCheckItem",
	kind: enyo.MenuItem,
	published: {
		checked: false
	},
	contentClassName: "enyo-menucheckitem-content",
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.checkedChanged();
	},
	checkedChanged: function() {
		this.$.item.checked = this.checked;
		this.$.item.stateChanged("checked");
	},
	selectedChanged: function() {
		this.inherited(arguments);
		this.setChecked(this.selected);
	}
});
