/**
	Implements an HTML button, with support for grouping using _enyo.Group_.
*/
enyo.kind({
	name: "enyo.Button",
	//* @protected
	kind: enyo.ToolDecorator,
	tag: "button",
	//* @public
	published: {
		//* When true, button is shown as disabled and does not generate tap
		//* events
		disabled: false
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.disabledChanged();
	},
	disabledChanged: function() {
		this.setAttribute("disabled", this.disabled);
	},
	tap: function() {
		this.setActive(true);
	}
});
