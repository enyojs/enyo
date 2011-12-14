enyo.kind({
	name: "enyo.SearchInput",
	kind: enyo.Input,
	className: "enyo-input enyo-search-input",
	changeOnInput: true,
	alwaysLooksFocused: true,
	hint: enyo._$L("Search"),
	keypressInputDelay: 250,
	events: {
		onCancel: ""
	},
	searchChrome: [
		{name: "icon", kind: "CustomButton", className: "enyo-search-input-search", onclick: "iconClick"}
	],
	//* @protected
	initComponents: function() {
		this.inherited(arguments);
		this.createChrome(this.searchChrome);
	},
	iconClick: function() {
		if (!this.isEmpty()) {
			this.setValue("");
			this.doCancel();
		}
	},
	inputHandler: function() {
		this.updateIconClass();
		return this.inherited(arguments);
	},
	updateIconClass: function() {
		var empty = this.isEmpty();
		if (empty != this.lastEmpty) {
			this.$.icon.addRemoveClass("enyo-search-input-cancel", !empty);
		}
		this.lastEmpty = empty;
	},
	valueChanged: function() {
		this.inherited(arguments);
		this.updateIconClass();
	}
});
