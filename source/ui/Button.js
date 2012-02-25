enyo.kind({
	name: "enyo.Button",
	kind: enyo.ToolDecorator,
	tag: "Button",
	published: {
		disabled: false
	},
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
