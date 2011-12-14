/**
A button that serves as a base control for <a href="#enyo.Picker">Picker</a>.
*/
enyo.kind({
	name: "enyo.PickerButton",
	kind: enyo.CustomButton,
	className: "enyo-custom-button enyo-picker-button",
	published: {
		focus: false
	},
	events: {
		onFocusChange: ""
	},
	components: [
		{name: "content", className: "enyo-picker-button-content"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.focusChanged();
	},
	contentChanged: function() {
		this.$.content.setContent(this.content);
	},
	focusChanged: function() {
		this.stateChanged("focus");
		this.doFocusChange();
	}
});
